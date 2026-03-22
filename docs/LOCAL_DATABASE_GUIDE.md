# Local database setup — a beginner-friendly walkthrough

This guide explains **what** was set up for the LTI ATS project, **why** each piece exists, and **how** to use it on your machine. It assumes you are new to PostgreSQL, Prisma, and migrations. Scope: **local development only** (no CI/CD).

---

## 1. The big picture

Your application needs to **store data** (candidates, users, interview types, etc.). That data lives in a **database**. Here we use:

| Piece | Role |
|--------|------|
| **PostgreSQL** | The actual database server: tables, rows, constraints. |
| **Docker** | Runs PostgreSQL in a container so you do not install PostgreSQL directly on Windows if you do not want to. |
| **Prisma** | A **toolkit** that sits between Node.js and PostgreSQL: you describe tables in `schema.prisma`, Prisma generates TypeScript types and SQL **migrations**. |
| **Migrations** | Versioned SQL scripts that change the database structure over time (create tables, add columns). |
| **Seed** | A script that inserts **initial reference data** (catalogs, demo company, dev user) after the schema exists. |

Think of **Prisma** as a contract: the schema file is the single source of truth for how tables look; migrations apply that contract to PostgreSQL.

---

## 2. What lives where (in this repo)

```
project-root/
├── docker-compose.yml          # Starts PostgreSQL
├── cv/                         # Uploaded CV files (git ignores contents; .gitkeep keeps folder)
├── backend/
│   ├── .env                    # DATABASE_URL (and later other secrets)
│   └── prisma/
│       ├── schema.prisma       # Models = tables and relations
│       ├── seed.ts             # Loads catalog + demo data
│       └── migrations/
│           └── <timestamp>_init_lti_ats/
│               └── migration.sql   # Raw SQL Prisma generated
```

- **`schema.prisma`**: You edit this when you need new tables or fields. It uses Prisma’s own language (not SQL).
- **`migrations/`**: Each folder is one **change** applied to the database. You normally **do not** hand-edit `migration.sql` after it is created; you add a new migration if you need changes.
- **`seed.ts`**: Runs with `npx prisma db seed`. It uses the **generated Prisma Client** (`@prisma/client`) to insert rows.

---

## 3. How PostgreSQL is started (Docker)

`docker-compose.yml` defines a service (often named `db`) that:

- Pulls the official `postgres` image.
- Sets user, password, and database name via environment variables.
- Maps port **5432** on your machine to the container.

**Typical commands** (from the project root):

```bash
docker compose up -d    # start in background
docker compose ps         # check status
docker compose down       # stop (data may persist in a volume)
```

Your backend connects using the same host (`localhost`), port (`5432`), user, password, and database name as in `backend/.env` → **`DATABASE_URL`**.

---

## 4. What `DATABASE_URL` is

Prisma reads **`DATABASE_URL`** from `backend/.env`. It is a single string with all connection info, for example:

```text
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

If this is wrong, `migrate` and `seed` will fail. Always keep `.env` out of git (it is usually gitignored).

---

## 5. Prisma schema (`schema.prisma`) — concepts

### Models = tables

Each `model Name { ... }` becomes a table. Fields map to columns (`String`, `Int`, `DateTime`, optional with `?`, etc.).

### Relations

Example: `Education` has `candidateId` and a `candidate` relation. Prisma creates a **foreign key** in PostgreSQL so you cannot attach education to a non-existent candidate.

### Cascading deletes

Example: if a `Candidate` is deleted, related `Education` rows can be removed automatically (`onDelete: Cascade`) so you do not leave orphan rows.

### Enums

`PositionStatus` is stored in PostgreSQL as an **enum type** (a fixed list of allowed values).

---

## 6. Migrations — what happens when you run them

1. Prisma compares `schema.prisma` to the current database state.
2. It generates SQL (`migration.sql`) that brings the database up to date.
3. A table `_prisma_migrations` records which migrations ran.

**Common commands** (from `backend/`):

```bash
npx prisma migrate dev --name describe_your_change   # dev: creates + applies migration
npx prisma migrate deploy                             # apply pending migrations (e.g. after pull)
npx prisma generate                                   # regenerate Prisma Client after schema change
```

For **local learning**, `migrate dev` is the usual command when you change the schema.

---

## 7. Seed script (`seed.ts`) — what it loads

The seed is **idempotent** where possible (safe to run more than once):

1. **InterviewType** — e.g. Technical, HR, Behavioral (unique names).
2. **InterviewFlow** — one default flow (“Default LTI hiring process”) if missing.
3. **InterviewStep** — three ordered steps linked to that flow and to a type (phone screen → technical → final).
4. **Company** — “LTI Demo Company” for future positions/employees.
5. **Employee** — one demo interviewer email.
6. **User** — a **local dev** recruiter account:
   - Username: `recruiter`
   - Password: `ChangeMe!Dev1`  
   Password is stored as a **bcrypt hash**, never plaintext.

**Security note:** Treat this user as **development-only**. Change the password in real shared environments.

Run:

```bash
cd backend
npx prisma db seed
```

---

## 8. CV folder (`cv/`)

Candidate resumes are stored as **files on disk** under `cv/` at the **repository root** (next to `frontend/` and `backend/`). The database only stores **metadata** (`filePath`, `fileType`, `uploadDate` on `Resume`).

`.gitignore` ignores uploaded files but keeps the folder via `.gitkeep` so the directory exists in git.

---

## 9. End-to-end: first-time local setup

From the **project root**:

1. Ensure **PostgreSQL is running**. Either:
   - start it with Docker: `docker compose up -d`, **or**
   - use PostgreSQL you already have running (no need for Docker in that case).
2. Ensure `backend/.env` has a correct **`DATABASE_URL`** as a **full connection string**. Node’s `dotenv` does **not** expand `${VAR}` inside values—write the URL explicitly (e.g. `postgresql://user:password@localhost:5432/LTIdb`).
3. From `backend/`:
   - `npm install`
   - `npx prisma migrate deploy` (or `migrate dev` if you are still evolving schema)
   - `npx prisma generate`
   - `npx prisma db seed`

The seed creates a **development recruiter** you can use to log into the app: username **`recruiter`**, password **`ChangeMe!Dev1`** (change in shared environments).

Then you can inspect data with Prisma Studio:

```bash
cd backend
npx prisma studio
```

---

## 10. Glossary

| Term | Meaning |
|------|--------|
| **ORM** | Object–Relational Mapping: work with objects in code that map to tables. |
| **Migration** | A versioned change to the database structure. |
| **Seed** | Initial data load (catalogs, demos). |
| **Prisma Client** | Generated TypeScript API: `prisma.candidate.create(...)`, etc. |
| **Schema** | In Prisma, the file that defines models; in PostgreSQL, sometimes means “namespace” (`public`). |

---

## 11. What comes next

The **backend** implements HTTP routes (login, create candidate, upload file), uses **Prisma Client**, and enforces rules that are not only in the DB (e.g. max three education rows per candidate). For a beginner-friendly walkthrough of Express, layers, sessions, and uploads, see **[LOCAL_BACKEND_GUIDE.md](./LOCAL_BACKEND_GUIDE.md)**.

This guide focuses on **database structure and local data loading**; the backend guide focuses on the **Node/Express application** that uses that database.
