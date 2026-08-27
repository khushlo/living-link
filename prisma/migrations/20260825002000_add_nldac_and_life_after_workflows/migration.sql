ALTER TABLE "financial_records" ADD COLUMN "reimbursement_status" TEXT NOT NULL DEFAULT 'not_submitted';
ALTER TABLE "financial_records" ADD COLUMN "reimbursement_notes" TEXT;

CREATE TABLE "nldac_applications" (
  "id" TEXT NOT NULL,
  "donor_profile_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "employment_type" TEXT,
  "is_us_resident" BOOLEAN,
  "has_surgery_date" BOOLEAN,
  "gross_income" DOUBLE PRECISION,
  "center_confirmed" BOOLEAN NOT NULL DEFAULT false,
  "application_ref" TEXT,
  "submitted_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "nldac_applications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "nldac_applications_donor_profile_id_updated_at_idx" ON "nldac_applications"("donor_profile_id", "updated_at");
ALTER TABLE "nldac_applications" ADD CONSTRAINT "nldac_applications_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "life_after_reminders" (
  "id" TEXT NOT NULL,
  "donor_profile_id" TEXT NOT NULL,
  "week" TEXT NOT NULL,
  "due_at" TIMESTAMP(3) NOT NULL,
  "sent_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "life_after_reminders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "life_after_reminders_donor_profile_id_week_key" ON "life_after_reminders"("donor_profile_id", "week");
CREATE INDEX "life_after_reminders_due_at_sent_at_idx" ON "life_after_reminders"("due_at", "sent_at");
ALTER TABLE "life_after_reminders" ADD CONSTRAINT "life_after_reminders_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "post_donation_checkins_donor_profile_id_week_key" ON "post_donation_checkins"("donor_profile_id", "week");
