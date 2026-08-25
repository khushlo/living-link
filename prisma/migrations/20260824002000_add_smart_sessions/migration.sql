-- Apply through the approved deployment process after backing up the target database.
CREATE TABLE "smart_sessions" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "token_endpoint" TEXT NOT NULL,
    "pkce_verifier" TEXT NOT NULL,
    "access_token_encrypted" TEXT,
    "patient_id_encrypted" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed_at" TIMESTAMP(3),

    CONSTRAINT "smart_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "smart_sessions_state_key" ON "smart_sessions"("state");
