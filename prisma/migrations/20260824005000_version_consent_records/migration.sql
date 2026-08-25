-- Preserve every consent submission so grant and revocation history is auditable.
-- Apply through the approved deployment process after backing up the target database.
DROP INDEX IF EXISTS "consent_records_donor_profile_id_purpose_key";
CREATE INDEX IF NOT EXISTS "consent_records_donor_profile_id_purpose_created_at_idx"
ON "consent_records"("donor_profile_id", "purpose", "created_at");
