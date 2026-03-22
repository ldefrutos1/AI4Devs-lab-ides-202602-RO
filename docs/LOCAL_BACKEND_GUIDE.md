# Local backend — a beginner-friendly walkthrough

This guide explains how the **LTI ATS backend** is built: technologies, folder layout, how an HTTP request flows through the code, and how authentication, validation, and file uploads fit together. It is written for readers who are **new to Node.js, Express, or layered backends**. Scope: **local development** (same spirit as [LOCAL_DATABASE_GUIDE.md](./LOCAL_DATABASE_GUIDE.md)).

Technical names (files, symbols, JSON keys) stay in **English** to match project conventions; the explanations are written in simple language.

---

## 1. What the backend actually is

The backend is a **long-running Node.js process** that:

1. Listens on a **TCP port** (here, usually **3010**).
2. Speaks **HTTP**: browsers or the React app send **requests** (`GET`, `POST`, …); the server sends **responses** (status code + JSON or file).
3. Uses **TypeScript** so types catch many mistakes before you run the code.
4. Talks to **PostgreSQL** through **Prisma** (see the database guide).

Think of it as a **waiter in a restaurant**: the client (frontend) orders (HTTP request); the kitchen (services + database) prepares; the waiter returns the dish (HTTP response). **Express** is the framework that routes “orders” to the right “kitchen station.”

---

## 2. Core technologies (short glossary)

| Term | What it means here |
|------|--------------------|
| **Node.js** | JavaScript runtime on your machine; runs the server. |
| **TypeScript** | JavaScript + static types; compiled to JavaScript (`npm run build` → `dist/`). |
| **Express** | Minimal library to create an HTTP server and attach **middleware** and **routes**. |
| **Middleware** | Functions that run **in order** for each request (e.g. parse JSON, check login, handle errors). |
| **Prisma Client** | Generated API to query the database (`prisma.user.findUnique`, …). |
| **Session** | Server-side memory of “who is logged in,” identified by a **cookie** in the browser. |
| **CORS** | Rules for whether a **different origin** (e.g. React on port 3000) may call this API with cookies. |
| **Multer** | Middleware for **multipart** uploads (e.g. PDF/DOCX files). |

---

## 3. Layered architecture (why folders look like this)

The project follows a **layered** style (similar to Domain-Driven Design in `backend-standards.mdc`):

| Layer | Folder | Responsibility |
|--------|--------|----------------|
| **Presentation** | `src/presentation/controllers/` | Turn HTTP request/response into calls to services; no business rules. |
| **Application** | `src/application/` | **Services** (orchestration), **validation** (input rules), **types** for payloads. |
| **Domain** | `src/domain/` | **Errors**, **repository interfaces** (contracts for data access), no Express or Prisma imports in interfaces. |
| **Infrastructure** | `src/infrastructure/` | **Prisma** wiring, **logger**, **multer**, **CV path** helpers, **repository implementations**. |

**Rule of thumb:** dependencies point **inward**: controllers → services → repositories → Prisma. That keeps business rules testable and swappable.

---

## 4. How a request flows through the app

1. **`src/index.ts`** loads environment variables (`src/loadEnv.ts`), then imports **`src/app.ts`** and starts **listening** on `PORT` (unless `NODE_ENV=test`, so tests do not bind a port).
2. **`src/app.ts`** creates `express()`, attaches:
   - **CORS** (allows the frontend origin + cookies),
   - **JSON body parser**,
   - **Session** (cookie + server-side session store in memory for local dev),
   - **Routes** (auth, candidates, upload),
   - **Error middleware** last (catches thrown errors and returns JSON).

3. A route (e.g. `POST /candidates`) runs **middleware** first (`requireAuth`), then the **controller**, which calls a **service**, which calls a **repository** and Prisma.

```
HTTP request
  → CORS / json / session
  → Route + middleware (e.g. requireAuth)
  → Controller
  → Service (validation + rules)
  → Repository (Prisma)
  → PostgreSQL
  ← JSON response (or error middleware)
```

---

## 5. Folder map (`backend/src/`)

```
backend/src/
├── loadEnv.ts                 # Loads .env before other modules use process.env
├── index.ts                   # Starts HTTP server (not used when testing app in isolation)
├── app.ts                     # Express app: middleware + routes + error handler
├── domain/
│   ├── errors/                # AppError, ValidationError, ConflictError, …
│   └── repositories/          # IUserRepository, ICandidateRepository (interfaces only)
├── application/
│   ├── services/              # AuthService, CandidateService
│   ├── validation/            # assertValidLoginPayload, assertValidCreateCandidatePayload, …
│   └── types/                 # DTO shapes for JSON bodies
├── infrastructure/
│   ├── prismaClient.ts        # Single PrismaClient instance
│   ├── logger.ts              # Structured logs (avoid logging passwords or bodies)
│   ├── multerCv.ts            # Multer config for PDF/DOCX under ../cv
│   ├── repositories/          # UserRepository, CandidateRepository (implement interfaces)
│   └── storage/
│       └── cvStorage.ts       # Absolute path to cv/, safe path checks
├── presentation/
│   └── controllers/           # authController, candidateController, uploadController
├── middleware/
│   ├── authMiddleware.ts      # requireAuth → 401 if no session userId
│   └── errorMiddleware.ts     # Maps errors to JSON (validation, multer, …)
├── routes/                    # Routers mounted in app.ts
└── types/
    └── express-session.d.ts   # Extends session with userId
```

---

## 6. Authentication (no JWT in this phase)

- **Login:** `POST /auth/login` with `{ "username", "password" }`. The **AuthService** loads the user via **UserRepository**, compares the password with **bcrypt** (`bcrypt.compare`), never stores or logs plaintext passwords.
- **Session:** On success, `req.session.userId` is set. Express **session** middleware issues a **cookie**; the browser sends it on later requests if **CORS** allows **credentials** and the frontend uses `fetch(..., { credentials: 'include' })`.
- **Protected routes:** `requireAuth` checks `req.session.userId` before `POST /candidates` and `POST /upload`.

For local dev, the session store is **in-memory** (fine for learning; production would use Redis or similar).

---

## 7. Creating a candidate (happy path)

1. **Log in** with the seeded recruiter (see database guide / seed) or your own user.
2. **Upload CV:** `POST /upload` with `multipart/form-data`, field name **`file`**. Multer saves under **`cv/`** at repo root and returns `{ filePath, fileType }` (e.g. stored filename + MIME type).
3. **Create candidate:** `POST /candidates` with **JSON** including `cv: { filePath, fileType }` from step 2.

The **CandidateService**:

- Runs **validation** (names, email format, max 3 educations, CV required, etc.).
- Checks the file **exists on disk** (`cvStorage`) to avoid fake paths.
- Saves everything in one **Prisma create** with nested `educations`, `workExperiences`, `resumes`.

If the email already exists, Prisma throws a **unique constraint** error (`P2002`); the service turns that into **`409`** with code **`EMAIL_ALREADY_EXISTS`**.

---

## 8. Errors and JSON responses

- **AppError** subclasses carry `statusCode` and `code` (e.g. `VALIDATION_ERROR`, `EMAIL_ALREADY_EXISTS`).
- The **error middleware** returns a consistent JSON shape such as:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable message",
    "code": "SOME_CODE",
    "details": null
  }
}
```

Validation errors may include **`details`** (field-level hints for the UI). Successful **`POST /candidates`** returns **201** with the candidate summary fields as in the OpenAPI spec (no `success` wrapper on that route by design).

---

## 9. Environment variables (backend)

Copy **`backend/.env.example`** to **`backend/.env`** and adjust:

| Variable | Role |
|----------|------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma. Must be a **literal URL** in `.env`—do not rely on `${DB_USER}`-style substitution unless your tooling expands it; plain `dotenv` does **not**. |
| `PORT` | Server port (default **3010** in code if unset). |
| `SESSION_SECRET` | Secret used to sign the session cookie (use a long random string in real deployments). |
| `FRONTEND_URL` | Allowed CORS origin for the React app (e.g. `http://localhost:3000`). |

`loadEnv.ts` runs before the rest of the app so Prisma and session see these values.

---

## 10. Useful commands

From **`backend/`**:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run TypeScript with auto-reload (`ts-node-dev`). |
| `npm run build` | Compile to `dist/` (`tsc`). |
| `npm start` | Run compiled `dist/index.js` (after build). |
| `npm test` | Run Jest tests. |
| `npx prisma studio` | Browse database in a simple UI. |

Ensure PostgreSQL is running (Docker with `docker compose up -d` **or** any instance you already use), and that migrations + seed are applied (see database guide). After seed, you can sign in with username **`recruiter`** and password **`ChangeMe!Dev1`** for local testing.

---

## 11. How this connects to the database guide

- **Prisma schema and migrations** live under `backend/prisma/`; the backend code does **not** write raw SQL for normal CRUD.
- **Repositories** encapsulate Prisma calls so services stay readable and testable.

Read **[LOCAL_DATABASE_GUIDE.md](./LOCAL_DATABASE_GUIDE.md)** first if you have not yet: it explains PostgreSQL, Docker, migrations, and seed data.

---

## 12. Glossary (quick reference)

| Term | Meaning |
|------|--------|
| **Route** | URL path + HTTP method handled by Express. |
| **Handler** | Function that runs for a route (often a controller method). |
| **DTO** | Data shape for JSON (e.g. create-candidate payload). |
| **Repository** | Object that reads/writes aggregates in the database behind an interface. |
| **Transaction** | (Future improvement) multiple DB steps that succeed or fail together; current create is a single `create` with nested relations. |

---

## 13. Suggested learning order

1. Run the server and call **`GET /`** in the browser or curl.
2. Call **`POST /auth/login`** (e.g. with Thunder Client / Postman); inspect **Set-Cookie**.
3. With the cookie, call **`POST /upload`** then **`POST /candidates`**.
4. Open **`src/app.ts`** and trace one route to the controller, service, and repository.
5. Skim **`backend-standards.mdc`** for naming, errors, and testing expectations when you add features.

This should give you a mental model of the backend; the frontend guide (when added) will show how React sends `credentials` and consumes these endpoints.
