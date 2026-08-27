CREATE TABLE "insurance_issues" (
    "id" TEXT NOT NULL,
    "donor_profile_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_issues_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "insurance_issues_donor_profile_id_created_at_idx" ON "insurance_issues"("donor_profile_id", "created_at");

ALTER TABLE "insurance_issues" ADD CONSTRAINT "insurance_issues_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
