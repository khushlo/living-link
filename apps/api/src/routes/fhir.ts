import { Router } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/auth";

const router = Router();
const FHIR_BASE = process.env.FHIR_SERVER_URL || "http://localhost:8080/fhir";

// Proxy all FHIR requests through the API (so FHIR server is never public-facing)
router.get("/metadata", async (_req, res) => {
  try {
    const { data } = await axios.get(`${FHIR_BASE}/metadata`);
    res.json(data);
  } catch {
    res.status(503).json({ error: "FHIR server unavailable" });
  }
});

// GET /api/fhir/Patient/:id
router.get("/Patient/:id", async (req: AuthRequest, res) => {
  try {
    const { data } = await axios.get(`${FHIR_BASE}/Patient/${req.params.id}`, {
      headers: { Accept: "application/fhir+json" },
    });
    res.json(data);
  } catch {
    res.status(404).json({ error: "Patient not found" });
  }
});

// POST /api/fhir/Patient  create a FHIR Patient resource
router.post("/Patient", async (req: AuthRequest, res) => {
  try {
    const { data } = await axios.post(`${FHIR_BASE}/Patient`, req.body, {
      headers: { "Content-Type": "application/fhir+json" },
    });
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create FHIR Patient", detail: err.message });
  }
});

// POST /api/fhir/Observation  submit a clinical observation (BP, BMI, etc.)
router.post("/Observation", async (req: AuthRequest, res) => {
  try {
    const { data } = await axios.post(`${FHIR_BASE}/Observation`, req.body, {
      headers: { "Content-Type": "application/fhir+json" },
    });
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create Observation", detail: err.message });
  }
});

// GET /api/fhir/export  FHIR Bulk Data export (de-identified, for HHS/ONC reporting)
router.get("/export", async (req: AuthRequest, res) => {
  // Only admin role can trigger bulk export
  if (req.userRole !== "ADMIN") return res.status(403).json({ error: "Admin only" });

  try {
    const { data } = await axios.get(`${FHIR_BASE}/Patient/$export`, {
      headers: {
        Accept: "application/fhir+json",
        Prefer: "respond-async",
      },
    });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Bulk export failed", detail: err.message });
  }
});

export default router;
