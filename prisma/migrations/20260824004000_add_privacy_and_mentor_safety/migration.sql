-- Apply through the approved deployment process after backing up the target database.
ALTER TABLE "mentor_profiles" ADD COLUMN IF NOT EXISTS "training_acknowledged_at" TIMESTAMP(3);

CREATE TABLE "data_deletion_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "reason" TEXT,
    CONSTRAINT "data_deletion_requests_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "data_deletion_requests"
ADD CONSTRAINT "data_deletion_requests_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "mentor_safety_reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "message_id" TEXT,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    CONSTRAINT "mentor_safety_reports_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "mentor_safety_reports"
ADD CONSTRAINT "mentor_safety_reports_reporter_id_fkey"
FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
