CREATE TABLE "ehr_registrations" (
    "id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "organization_website" TEXT,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "vendor" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "fhir_issuer" TEXT NOT NULL,
    "fhir_version" TEXT NOT NULL DEFAULT 'R4',
    "smart_supported" BOOLEAN NOT NULL DEFAULT false,
    "cds_hooks_supported" BOOLEAN NOT NULL DEFAULT false,
    "requested_scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,
    "ehr_connection_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ehr_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ehr_registrations_ehr_connection_id_key" ON "ehr_registrations"("ehr_connection_id");
CREATE INDEX "ehr_registrations_approved_rejected_at_created_at_idx" ON "ehr_registrations"("approved", "rejected_at", "created_at");
CREATE INDEX "ehr_registrations_fhir_issuer_environment_idx" ON "ehr_registrations"("fhir_issuer", "environment");

ALTER TABLE "ehr_registrations" ADD CONSTRAINT "ehr_registrations_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ehr_registrations" ADD CONSTRAINT "ehr_registrations_ehr_connection_id_fkey" FOREIGN KEY ("ehr_connection_id") REFERENCES "ehr_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
