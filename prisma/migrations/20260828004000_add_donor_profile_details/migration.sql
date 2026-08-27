ALTER TABLE "users" ADD COLUMN "phone" TEXT;

ALTER TABLE "donor_profiles"
  ADD COLUMN "date_of_birth" TIMESTAMP(3),
  ADD COLUMN "donation_type" TEXT,
  ADD COLUMN "transplant_center_name" TEXT;
