-- Donors must explicitly authorize each center before discovery or linking.
CREATE TABLE "donor_center_authorizations" (
    "id" TEXT NOT NULL,
    "donor_profile_id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "donor_center_authorizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "donor_center_authorizations_donor_profile_id_center_id_key" ON "donor_center_authorizations"("donor_profile_id", "center_id");
CREATE INDEX "donor_center_authorizations_center_id_revoked_at_idx" ON "donor_center_authorizations"("center_id", "revoked_at");
ALTER TABLE "donor_center_authorizations" ADD CONSTRAINT "donor_center_authorizations_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "donor_center_authorizations" ADD CONSTRAINT "donor_center_authorizations_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "transplant_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Existing links predate center-specific donor consent and cannot be grandfathered in.
DELETE FROM "external_patient_mappings";

-- Enforce authorization at the database boundary as well as in center routes.
CREATE OR REPLACE FUNCTION require_center_donor_authorization()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM "ehr_connections" connection
         JOIN "donor_center_authorizations" donor_authorization
           ON donor_authorization."center_id" = connection."organization_center_id"
          AND donor_authorization."donor_profile_id" = NEW."donor_profile_id"
          AND donor_authorization."revoked_at" IS NULL
        WHERE connection."id" = NEW."connection_id"
    ) THEN
        RAISE EXCEPTION 'active donor authorization for this center is required';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "external_patient_mappings_require_authorization"
BEFORE INSERT OR UPDATE ON "external_patient_mappings"
FOR EACH ROW EXECUTE FUNCTION require_center_donor_authorization();

ALTER TABLE "data_deletion_requests"
  ADD COLUMN "anonymization_attempted_at" TIMESTAMP(3),
  ADD COLUMN "failure_step" TEXT,
  ADD COLUMN "failure_message" TEXT,
  ADD COLUMN "evidence_pseudonym" TEXT;

-- Audit rows remain append-only except for this constrained anonymization update.
-- The application enables the transaction-local flag only while completing deletion.
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF current_setting('app.audit_anonymization', true) = 'on'
           AND NEW."id" = OLD."id"
           AND NEW."user_id" IS NOT DISTINCT FROM OLD."user_id"
           AND NEW."action" = OLD."action"
           AND NEW."resource_type" = OLD."resource_type"
           AND NEW."resource_id" IS NOT DISTINCT FROM OLD."resource_id"
           AND NEW."timestamp" = OLD."timestamp"
           AND NEW."ip_address" IS NULL
           AND NEW."user_agent" IS NULL
           AND NEW."metadata" = '{"anonymized":true}'::jsonb
        THEN
            RETURN NEW;
        END IF;
    END IF;
    RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;
