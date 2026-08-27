-- Forward migration for tenant-scoped EHR identity and authorization context.
CREATE TYPE "SmartLaunchType" AS ENUM ('EHR', 'STANDALONE');

CREATE TABLE "ehr_connections" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "organization_center_id" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "client_configuration_ref" TEXT,
    "allowed_capabilities" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ehr_connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ehr_connections_issuer_environment_key" ON "ehr_connections"("issuer", "environment");
CREATE INDEX "ehr_connections_organization_center_id_enabled_idx" ON "ehr_connections"("organization_center_id", "enabled");

CREATE TABLE "external_patient_mappings" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "donor_profile_id" TEXT NOT NULL,
    "external_patient_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "external_patient_mappings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "external_patient_mappings_connection_id_external_patient_id_key" ON "external_patient_mappings"("connection_id", "external_patient_id");
CREATE UNIQUE INDEX "external_patient_mappings_connection_id_donor_profile_id_key" ON "external_patient_mappings"("connection_id", "donor_profile_id");

ALTER TABLE "smart_sessions"
  ADD COLUMN "connection_id" TEXT,
  ADD COLUMN "launch_type" "SmartLaunchType" NOT NULL DEFAULT 'EHR',
  ADD COLUMN "local_user_id" TEXT,
  ADD COLUMN "local_center_id" TEXT,
  ADD COLUMN "authorized_patient_context" TEXT,
  ADD COLUMN "granted_scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "token_metadata" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "ehr_connections" ADD CONSTRAINT "ehr_connections_organization_center_id_fkey" FOREIGN KEY ("organization_center_id") REFERENCES "transplant_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "external_patient_mappings" ADD CONSTRAINT "external_patient_mappings_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "ehr_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "external_patient_mappings" ADD CONSTRAINT "external_patient_mappings_donor_profile_id_fkey" FOREIGN KEY ("donor_profile_id") REFERENCES "donor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "smart_sessions" ADD CONSTRAINT "smart_sessions_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "ehr_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "smart_sessions" ADD CONSTRAINT "smart_sessions_local_user_id_fkey" FOREIGN KEY ("local_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
