# LivingLink - Living Kidney Donor Platform

> Prototype web application supporting living kidney donors from evaluation through long-term follow-up.
> Built for the **KidneyX EMPOWER Prize - Track B**.

> **Prototype notice:** LivingLink is not a medical device, diagnostic service, production clinical system, or verified EHR integration. Do not use real patient or donor data. HIPAA compliance, Section 508/WCAG conformance, Epic/Oracle Health connectivity, and clinical effectiveness have not been established. See `Documents/evidence-register.md` for evidence status.

## Modules

| Module | Audience | Prototype scope |
|---|---|---|
| **ReadyCheck** | Donor | Non-diagnostic health readiness and goal tracking with FHIR mapping support |
| **DonorShield** | Donor | NLDAC guidance, wage estimates, and expense workflows |
| **MentorMatch** | Donor | Peer mentor profiles and prototype messaging |
| **CenterFlow** | Clinician / Coordinator | Evaluation-stage and protocol workflows |
| **LifeAfter** | Donor | Post-donation check-ins and wellbeing tracking |

## Current Architecture

- **Application:** One root Next.js 15 App Router application (`app/`), including UI and server route handlers (`app/api/`)
- **Language/UI:** TypeScript, React 19, Tailwind CSS 3, shadcn/ui/Radix components
- **Authentication:** Clerk integration with application role checks; production configuration and control evidence are pending
- **Data:** Prisma ORM with the root schema at `prisma/schema.prisma`; PostgreSQL is used for local development
- **FHIR:** FHIR R4 mapping, SMART launch, CDS Hooks, and export prototypes; profile, EHR-vendor, and production workflow validation are pending
- **AI:** Optional OpenAI integration; authenticated health-data processing is disabled unless deployment configuration explicitly allows it
- **Local services:** Docker Compose can run PostgreSQL and HAPI FHIR R4

This repository is not a Turborepo and does not contain a separate Express API.

## Project Structure

```text
app/                 # Next.js pages, layouts, and route handlers
components/          # Shared and feature UI
lib/                 # Server/application utilities and FHIR helpers
prisma/              # Prisma schema and migrations
docker/              # Local service configuration
scripts/             # Submission PDF generation
Documents/           # Planning, claims, and evidence documentation
tests/               # Current test assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker, if using the local PostgreSQL and HAPI FHIR services
- Clerk development credentials for authenticated routes
- OpenAI API credentials only if testing optional AI features

### Install And Configure

```bash
git clone https://github.com/khushlo/living-link.git
cd living-link
npm install
```

Copy `.env.example` to `.env.local`, fill in development values, and keep `FHIR_WRITE_ENABLED=false` and `ALLOW_PHI_TO_AI=false` unless an approved test configuration requires otherwise. Never use production PHI in this prototype.

### Start Local Dependencies

```bash
docker compose up -d postgres hapi-fhir
npx prisma migrate deploy
```

### Run The Application

```bash
npm run dev
```

The single Next.js development server runs at `http://localhost:3000`; there is no Express server on port 4000.

## Status And Claims

Implemented source code is not, by itself, evidence of deployed behavior, regulatory compliance, accessibility conformance, vendor integration, clinical validity, or completed co-design. Current and target claims, evidence gaps, and revalidation fields are recorded in `Documents/evidence-register.md`.

## License

MIT
