# Preflight Checklist — Architecture (Short)

Purpose: concise reference of components, data flow, endpoints, and deployment notes.

## 1. High-level overview

Browser (React/Vite) ↔ HTTP ↔ Frontend (Axios) ↔ Backend (Express) ↔ Persistence (JSON files in `backend/data`)

## 2. Frontend (summary)

- `App.jsx`: Flight info form + Checklist table; uses React hooks for state.
- Key state: `flightInfo`, `items`, `editingFlightField`, `editingId`.
- Network: Axios calls to `http://localhost:5000` (set `VITE_API_BASE_URL`).
- Behavior highlights:
  - Flight lookup triggered on Flight Number `onBlur` → GET `/api/flight-info?flightNumber=X`.
  - Edits are local; Save button sends full `PUT /api/flight-info` to persist.
  - Checklist rows edit → `PUT /api/checklist/{id}` with `{status, comment}`.

## 3. Backend (summary)

- `server.js` exposes routes: GET/PUT `/api/flight-info`, GET `/api/checklist`, PUT `/api/checklist/:id`.
- Data helpers: `readFlightInfo`, `writeFlightInfo`, `readChecklist`, `writeChecklist` (file-based).
- Important: files must be UTF-8 without BOM. Current implementation uses synchronous fs operations (last-write-wins).

## 4. API quick reference

- `GET /api/flight-info[?flightNumber=X]` → returns flight object
- `PUT /api/flight-info` → body: full flight object (requires `flightNumber`)
- `GET /api/checklist` → returns array of checks
- `PUT /api/checklist/{id}` → body: `{ status, comment }`

Error format: `{ "error": "message" }`.

## 5. Data models (short)

- Flight info (example):

```json
{ "id":1, "flightNumber":"123", "flightDate":"2025-11-17T08:57:05Z", "filedBy":"Pilot" }
```

- Checklist item (example):

```json
{ "id":2, "check":"WINDY DATA","status":"Completed","comment":"OK" }
```

Note: API uses `flightDate` — frontend maps to `date` in state.

## 6. Deployment notes

- Ports: frontend 3000, backend 5000
- In Docker Compose, frontend container can call `http://backend:5000` (service name) when in the same network
- Persist `backend/data` as a bind mount or named volume to retain JSON across restarts

## 7. Operational notes & gotchas

- File encoding: ensure UTF-8 without BOM for `flight-info.json` and `checklist.json` — a BOM causes JSON.parse errors
- Concurrency: current storage is file-based (last write wins). For concurrent users consider moving to a small DB (SQLite/Postgres)
- Performance: file I/O is synchronous; for higher load migrate to async file ops or a DB
- CORS: in development backend permits requests from `http://localhost:3000`; tighten for production

## 8. Next steps (suggested)

- Replace file storage with SQLite or lightweight DB for concurrency and durability
- Add basic authentication for production (API token or OAuth)
- Add request rate limiting and retries for frontend API calls
- Convert backend file ops to async `fs.promises` and add locking/transaction semantics

If you want this reduced further (one-line quickstart) or expanded (OpenAPI spec or diagrams), tell me which and I will create it.
