-- Apply through the approved deployment process after backing up the target database.
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "donor_profile_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consent_records_donor_profile_id_purpose_key"
ON "consent_records"("donor_profile_id", "purpose");

ALTER TABLE "consent_records"
ADD CONSTRAINT "consent_records_donor_profile_id_fkey"
FOREIGN KEY ("donor_profile_id") REFERENCES "donor_profiles"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
