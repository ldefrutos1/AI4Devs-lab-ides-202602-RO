# Database creation prompt (LTI ATS)

Use this prompt when delegating database work to a tool or teammate. Source of truth: `data-model.md` in this folder and `backend/prisma/schema.prisma` in the repository.

## Goal

Design and apply a **PostgreSQL** schema (via **Prisma**) for the LTI ATS that supports:

1. **Recruiter authentication:** `User` with unique `username` and `passwordHash` (one-way hash at rest; never store plaintext passwords).
2. **Candidate domain:** `Candidate` (unique email), `Education` (0–3 per candidate), `WorkExperience` (unbounded count), `Resume` (metadata for files stored on disk under repo `cv/`).
3. **Hiring domain (future APIs):** `Company`, `Employee`, `InterviewType`, `InterviewFlow`, `InterviewStep`, `Position`, `Application`, `Interview` with relationships as in the ER diagram in `data-model.md`.

## Technical constraints

- **DB:** PostgreSQL (Docker Compose in project root).
- **ORM:** Prisma; `DATABASE_URL` in `backend/.env`.
- **Naming:** English table/column names; string lengths aligned with `data-model.md` (e.g. candidate phone max 30 chars).
- **Integrity:** Foreign keys, unique constraints where specified (candidate email, company name, employee email, user username, interview type name for catalog stability).
- **Position status:** Enum or checked string: `Open`, `Contratado`, `Cerrado`, `Borrador`; default aligned with product (e.g. `Borrador`).
- **IDs:** Integer autoincrement primary keys unless product requires UUIDs later.

## Catalog and seed data

Load **reference data** for:

- **InterviewType** — e.g. Technical, HR, Behavioral (unique `name`).
- **InterviewFlow** — at least one default flow (description identifies it in seed).
- **InterviewStep** — ordered steps linked to the flow and to an interview type (`orderIndex` unique per flow).
- **Company** — at least one demo company for future `Position` / `Employee` rows.

Optional: one **Employee** linked to that company; optional **User** row for local dev (hashed password only).

Idempotent seed: safe to run more than once (upsert / find-or-create).

## Deliverables

- `backend/prisma/schema.prisma` reflecting the model.
- Initial migration under `backend/prisma/migrations/`.
- `backend/prisma/seed.ts` (+ `package.json` `prisma.seed`) for catalogs.
- Document any intentional deviation from `data-model.md`.

## Out of scope for the DB layer

- HTTP APIs, session cookies, file upload implementation.
- Business validation (max three educations per save) — enforced in application layer; DB may optionally use check constraints or triggers later.

## Verification

- `npx prisma generate`
- `npx prisma migrate deploy` (or `migrate dev` in development)
- `npx prisma db seed`

## Seeded development user (optional)

The repository seed creates a **recruiter** account for local testing only:

- **Username:** `recruiter`
- **Password:** `ChangeMe!Dev1` (rotate in any shared or production-like environment)

This is defined in `backend/prisma/seed.ts`; catalogs (`InterviewType`, `InterviewFlow`, `InterviewStep`, `Company`, `Employee`) are idempotent via `upsert` / find-or-create.

## Schema note

`Application` stores the current step as `interviewStepId` (nullable). The older duplicate field name `currentInterviewStep` from narrative docs is not modeled as a separate column.
