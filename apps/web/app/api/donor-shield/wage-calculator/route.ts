import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rate = Number(searchParams.get("hourlyRate"));
  const hours = Number(searchParams.get("hoursPerWeek"));
  const weeks = Number(searchParams.get("recoveryWeeks"));

  if (!rate || !hours || !weeks) {
    return NextResponse.json(
      { error: "hourlyRate, hoursPerWeek, recoveryWeeks required" },
      { status: 400 }
    );
  }

  const estimatedLoss = rate * hours * weeks;
  const nldacMax = 6000;
  const potentialNLDACCover = Math.min(estimatedLoss, nldacMax);

  return NextResponse.json({
    estimatedWageLoss: estimatedLoss,
    nldacMaxReimbursement: nldacMax,
    potentialCoverage: potentialNLDACCover,
    estimatedOutOfPocket: Math.max(0, estimatedLoss - potentialNLDACCover),
    disclaimer: "Estimates only. Contact NLDAC at nldac.org or 1-877-696-2110 for actual eligibility.",
  });
}
