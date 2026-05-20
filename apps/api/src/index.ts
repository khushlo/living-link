import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import { authMiddleware } from "./middleware/auth";
import { auditMiddleware } from "./middleware/audit";
import { errorHandler } from "./middleware/error";

import mentorMatchRouter from "./routes/mentor-match";
import readyCheckRouter from "./routes/ready-check";
import donorShieldRouter from "./routes/donor-shield";
import centerFlowRouter from "./routes/center-flow";
import lifeAfterRouter from "./routes/life-after";
import fhirRouter from "./routes/fhir";
import aiRouter from "./routes/ai";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan("combined"));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check (no auth required) ──────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ── Auth + audit on all /api routes ──────────────────────────────────────────
app.use("/api", authMiddleware);
app.use("/api", auditMiddleware);

// ── Module routes ─────────────────────────────────────────────────────────────
app.use("/api/mentor-match", mentorMatchRouter);
app.use("/api/ready-check", readyCheckRouter);
app.use("/api/donor-shield", donorShieldRouter);
app.use("/api/center-flow", centerFlowRouter);
app.use("/api/life-after", lifeAfterRouter);
app.use("/api/fhir", fhirRouter);
app.use("/api/ai", aiRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫁 LivingLink API running on http://localhost:${PORT}`);
  console.log(`🏥 FHIR server: ${process.env.FHIR_SERVER_URL}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
