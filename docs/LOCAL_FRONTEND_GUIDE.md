# Local frontend — recruiter add-candidate flow

This short guide explains what the React app does for **recruiters**: login, dashboard, and the **add candidate** form. It complements [LOCAL_BACKEND_GUIDE.md](./LOCAL_BACKEND_GUIDE.md). Technical identifiers stay in **English**; the UI is available in **English** and **Spanish** (user choice).

---

## 1. Configuration

| File | Purpose |
|------|---------|
| `frontend/.env.local` | Create from `.env.example`. Set `REACT_APP_API_URL` (e.g. `http://localhost:3010`). |
| `backend/.env` | `FRONTEND_URL` must match the React dev server (e.g. `http://localhost:3000`) for **CORS** and **session cookies**. |

The browser sends cookies only if the frontend uses `credentials: 'include'` (Axios: `withCredentials: true` on the shared client; `fetch` for uploads uses `credentials: 'include'`).

---

## 2. Routes

| Path | Purpose |
|------|---------|
| `/login` | Username/password; establishes session cookie. |
| `/dashboard` | Recruiter home: welcome text + **primary CTA** “Add new candidate”. |
| `/candidates/new` | Full form: name, email, phone, address, dynamic education (0–3) and work experience, CV (PDF/DOCX). |

Unauthenticated users are redirected to `/login` (with `state.from` so they can return after signing in).

---

## 3. Behaviour (acceptance criteria mapping)

- **Visible entry point:** Large primary button on the dashboard card + **Add candidate** in the top navigation.
- **Form fields:** All required candidate fields plus optional education/work blocks; CV required before submit.
- **Validation:** Client-side checks (email shape, names, phone, address length, education cap, row completeness, file type/size) before calling the API; server errors are shown in an alert.
- **Upload:** On submit, the app **uploads the file** first (`POST /upload`), then **creates the candidate** (`POST /candidates`) with `cv.filePath` and `cv.fileType` from the upload response.
- **Success:** Dismissible success alert + **Add another candidate** to reset the form (supports consecutive registrations).
- **Errors:** Network and API messages surfaced with `role="alert"` / `aria-live` where appropriate.
- **Accessibility:** Skip link to `#main-content`, labels tied to controls, focus styles, semantic headings; layout uses **Bootstrap 5** for responsive grids.
- **i18n:** Language selector in the navbar; choice persisted in `localStorage` (`lti-locale`).
- **Autocomplete:** Not implemented (backlog per product note).

---

## 4. Key source locations

```
frontend/src/
├── App.tsx                 # Router + providers
├── context/                # Auth + locale
├── i18n/strings.ts         # EN/ES copy
├── pages/                  # Login, Dashboard, AddCandidate
├── services/               # apiClient, auth, upload (fetch), candidate (axios)
├── utils/                  # validateCandidateForm, apiErrors
└── components/             # AppLayout, ProtectedRoute
```

---

## 5. Run locally (full stack)

1. **PostgreSQL** must be running (Docker: `docker compose up -d` from repo root, **or** your own server—no Docker required if it is already up).
2. **`backend/.env`**: resolved `DATABASE_URL`, plus `FRONTEND_URL=http://localhost:3000` and `SESSION_SECRET` (see [LOCAL_BACKEND_GUIDE.md](./LOCAL_BACKEND_GUIDE.md)).
3. **`frontend/.env.local`**: `REACT_APP_API_URL=http://localhost:3010` (or your API URL).
4. One-time from `backend/`: `npx prisma migrate deploy && npx prisma generate && npx prisma db seed`.
5. Two terminals:
   - **API:** `cd backend && npm run dev` → http://localhost:3010  
   - **UI:** `cd frontend && npm install && npm start` → http://localhost:3000  

**Test login (after seed):** username **`recruiter`**, password **`ChangeMe!Dev1`**.

Then open the app, sign in, and use **Add candidate** from the dashboard.
