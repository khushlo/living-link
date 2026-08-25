-- Apply through the approved deployment process after backing up the target database.
CREATE TABLE "safety_escalations" (
    "id" TEXT NOT NULL,
    "phq2_response_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "safety_escalations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "safety_escalations_phq2_response_id_key"
ON "safety_escalations"("phq2_response_id");

ALTER TABLE "safety_escalations"
ADD CONSTRAINT "safety_escalations_phq2_response_id_fkey"
FOREIGN KEY ("phq2_response_id") REFERENCES "phq2_responses"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
