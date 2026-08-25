-- Apply through the approved deployment process after backing up the target database.
CREATE TABLE "story_submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "donation_type" TEXT NOT NULL,
    "donation_year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "consented_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,
    CONSTRAINT "story_submissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "story_submissions_status_created_at_idx" ON "story_submissions"("status", "created_at");
ALTER TABLE "story_submissions" ADD CONSTRAINT "story_submissions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
