import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export class AnonymizationError extends Error {
  constructor(public readonly step: string) {
    super("Transactional anonymization failed");
    this.name = "AnonymizationError";
  }
}

export function isAnonymizationVerified(
  identity: { clerkId: string; email: string; firstName: string | null; lastName: string | null; phone: string | null } | null,
  pseudonym: string,
  remainingCounts: number[],
) {
  return identity?.clerkId === `deleted_${pseudonym}`
    && identity.email === `${pseudonym}@deleted.invalid`
    && !identity.firstName
    && !identity.lastName
    && !identity.phone
    && remainingCounts.every((count) => count === 0);
}

export async function anonymizeDeletionRequest(requestId: string, resolvedById: string) {
  let step = "load_request";
  const attemptedAt = new Date();
  try {
    return await prisma.$transaction(async (transaction) => {
      const request = await transaction.dataDeletionRequest.findUnique({ where: { id: requestId }, select: { userId: true, status: true } });
      if (!request) throw new AnonymizationError("load_request");
      if (request.status === "COMPLETED") return { requestId, alreadyCompleted: true };

      const pseudonym = randomUUID();
      const userId = request.userId;
      step = "load_dependencies";
      const profile = await transaction.donorProfile.findUnique({ where: { userId }, select: { id: true } });
      const sentMessages = await transaction.message.findMany({ where: { senderId: userId }, select: { id: true } });
      const matches = await transaction.mentorMatch.findMany({ where: { OR: [{ candidateId: userId }, { mentorId: userId }] }, select: { id: true } });
      const matchIds = matches.map(({ id }) => id);
      const messageIds = sentMessages.map(({ id }) => id);

      step = "delete_user_content";
      await transaction.mentorSafetyReport.deleteMany({ where: { OR: [{ reporterId: userId }, { messageId: { in: messageIds } }] } });
      if (matchIds.length) {
        const threads = await transaction.messageThread.findMany({ where: { matchId: { in: matchIds } }, select: { id: true } });
        await transaction.message.deleteMany({ where: { threadId: { in: threads.map(({ id }) => id) } } });
        await transaction.messageThread.deleteMany({ where: { matchId: { in: matchIds } } });
        await transaction.mentorMatch.deleteMany({ where: { id: { in: matchIds } } });
      }
      await transaction.message.deleteMany({ where: { senderId: userId } });
      await transaction.mentorProfile.deleteMany({ where: { userId } });
      await transaction.storySubmission.deleteMany({ where: { userId } });
      await transaction.forumPost.deleteMany({ where: { authorId: userId } });
      await transaction.notification.deleteMany({ where: { userId } });
      await transaction.smartSession.deleteMany({ where: { localUserId: userId } });
      await transaction.centerMembership.deleteMany({ where: { userId } });

      if (profile) {
        step = "delete_donor_data";
        const goals = await transaction.healthGoal.findMany({ where: { donorProfileId: profile.id }, select: { id: true } });
        const responses = await transaction.pHQ2Response.findMany({ where: { donorProfileId: profile.id }, select: { id: true } });
        await transaction.safetyEscalation.deleteMany({ where: { phq2ResponseId: { in: responses.map(({ id }) => id) } } });
        await transaction.goalProgressLog.deleteMany({ where: { goalId: { in: goals.map(({ id }) => id) } } });
        await transaction.externalPatientMapping.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.donorCenterAuthorization.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.consentRecord.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.eligibilityCheck.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.healthGoal.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.financialRecord.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.nLDACApplication.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.insuranceIssue.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.postDonationCheckin.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.pHQ2Response.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.lifeAfterReminder.deleteMany({ where: { donorProfileId: profile.id } });
        await transaction.donorProfile.delete({ where: { id: profile.id } });
      }

      step = "pseudonymize_audit_evidence";
      await transaction.$executeRaw`SELECT set_config('app.audit_anonymization', 'on', true)`;
      await transaction.auditLog.updateMany({
        where: { userId },
        data: { ipAddress: null, userAgent: null, metadata: { anonymized: true } },
      });

      step = "anonymize_identity";
      await transaction.user.update({
        where: { id: userId },
        data: {
          clerkId: `deleted_${pseudonym}`,
          email: `${pseudonym}@deleted.invalid`,
          firstName: null,
          lastName: null,
          phone: null,
          preferredLang: "en",
          role: "DONOR",
        },
      });
      await transaction.dataDeletionRequest.updateMany({
        where: { userId },
        data: { reason: null, failureStep: null, failureMessage: null },
      });

      step = "verify_anonymization";
      const [identity, remainingProfile, remainingRecords, remainingAuditIdentifiers] = await Promise.all([
        transaction.user.findUnique({ where: { id: userId }, select: { clerkId: true, email: true, firstName: true, lastName: true, phone: true } }),
        transaction.donorProfile.count({ where: { userId } }),
        Promise.all([
          transaction.centerMembership.count({ where: { userId } }),
          transaction.mentorProfile.count({ where: { userId } }),
          transaction.mentorMatch.count({ where: { OR: [{ candidateId: userId }, { mentorId: userId }] } }),
          transaction.message.count({ where: { senderId: userId } }),
          transaction.mentorSafetyReport.count({ where: { reporterId: userId } }),
          transaction.storySubmission.count({ where: { userId } }),
          transaction.forumPost.count({ where: { authorId: userId } }),
          transaction.notification.count({ where: { userId } }),
          transaction.smartSession.count({ where: { localUserId: userId } }),
        ]),
        transaction.auditLog.count({ where: { userId, OR: [{ ipAddress: { not: null } }, { userAgent: { not: null } }, { NOT: { metadata: { equals: { anonymized: true } } } }] } }),
      ]);
      if (!isAnonymizationVerified(identity, pseudonym, [remainingProfile, ...remainingRecords, remainingAuditIdentifiers])) {
        throw new AnonymizationError("verify_anonymization");
      }

      step = "complete_request";
      await transaction.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          resolvedAt: new Date(),
          resolvedById,
          anonymizationAttemptedAt: attemptedAt,
          evidencePseudonym: pseudonym,
          failureStep: null,
          failureMessage: null,
        },
      });
      return { requestId, alreadyCompleted: false };
    });
  } catch (cause) {
    const failureStep = cause instanceof AnonymizationError ? cause.step : step;
    await prisma.dataDeletionRequest.updateMany({
      where: { id: requestId, status: { not: "COMPLETED" } },
      data: {
        status: "FAILED",
        resolvedAt: null,
        resolvedById,
        anonymizationAttemptedAt: attemptedAt,
        failureStep,
        failureMessage: "Transactional anonymization failed",
      },
    }).catch(() => undefined);
    throw new AnonymizationError(failureStep);
  }
}
