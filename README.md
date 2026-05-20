# LivingLink — Living Kidney Donor Platform

> AI-powered, FHIR-native platform supporting living kidney donors from evaluation through long-term follow-up.
> Built for the **KidneyX EMPOWER Prize — Track B** (deadline June 15, 2026).

---

## Modules

| Module | Audience | Description |
|---|---|---|
| **ReadyCheck** | Donor | AI-guided health goal tracker (BMI, BP, labs) with FHIR Observation sync |
| **DonorShield** | Donor | NLDAC application wizard + wage replacement / expense log |
| **MentorMatch** | Donor | Peer mentor matching with in-app messaging |
| **CenterFlow** | Clinician / Coordinator | Protocol adherence tracker, evaluation stage pipeline |
| **LifeAfter** | Donor | Post-donation wellbeing check-ins (PHQ-2, BP trends) |

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS v3, shadcn/ui
- **Auth:** Clerk (RBAC — donor / patient / clinician / coordinator)
- **Backend:** Express + Prisma ORM
- **Database:** PostgreSQL
- **AI:** OpenAI GPT-4o (per-module system prompts)
- **FHIR:** HAPI FHIR R4 (`@livinglink/fhir-client`)
- **Monorepo:** Turborepo + npm workspaces

---

## Project Structure

```
apps/
  web/          # Next.js 15 frontend
  api/          # Express REST API (port 4000)
packages/
  shared/       # TypeScript types shared across apps
  ai/           # OpenAI chat wrapper with module prompts
  fhir-client/  # FHIR R4 client + LOINC constants
docker/
  postgres/     # PostgreSQL init script
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- Clerk account (free tier works)
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/khushlo/living-link.git
cd living-link
npm install
```

### 2. Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kidney-x
CLERK_SECRET_KEY=sk_test_...
```

### 3. Database Setup

```bash
cd apps/api
npx prisma db push
```

### 4. Run Development Servers

```bash
# From repo root — starts both Next.js (:3000) and Express (:4000)
npm run dev
```

---

## Routes

| Path | Role |
|---|---|
| `/` | Public landing page |
| `/sign-in`, `/sign-up` | Clerk hosted auth |
| `/donor/dashboard` | Donor home |
| `/ready-check` | ReadyCheck module |
| `/donor-shield` | DonorShield module |
| `/mentor-match` | MentorMatch module |
| `/life-after` | LifeAfter module |
| `/clinician/dashboard` | Clinician home |
| `/clinician/center-flow` | CenterFlow (clinician) |
| `/coordinator/dashboard` | Coordinator home |
| `/coordinator/center-flow` | CenterFlow (coordinator) |
| `/patient/dashboard` | Patient home |

---

## License

MIT
