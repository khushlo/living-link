-- Create separate database for HAPI FHIR
CREATE DATABASE livinglink_fhir;
GRANT ALL PRIVILEGES ON DATABASE livinglink_fhir TO livinglink;

-- Enable pgAudit extension for audit logging
CREATE EXTENSION IF NOT EXISTS pgaudit;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create schemas for data separation (PHI vs app data vs audit)
\c livinglink;
CREATE SCHEMA IF NOT EXISTS app_data;
CREATE SCHEMA IF NOT EXISTS phi_data;
CREATE SCHEMA IF NOT EXISTS audit_log;
