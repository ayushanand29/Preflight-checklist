# API Reference (Short)

Base URL
- Local: `http://localhost:5000`

Endpoints (quick)
- `GET /api/flight-info[?flightNumber=X]` — fetch flight record (all or by flightNumber)
- `PUT /api/flight-info` — create/update flight record (body JSON)
- `GET /api/checklist` — fetch all checklist items
- `PUT /api/checklist/{id}` — update checklist item (status/comment)

Minimal request examples
- Fetch all flight info:
```bash
curl http://localhost:5000/api/flight-info
```
- Lookup flight by number:
```bash
curl "http://localhost:5000/api/flight-info?flightNumber=123"
```
- Save flight info:
```bash
curl -X PUT http://localhost:5000/api/flight-info \
  -H "Content-Type: application/json" \
  -d '{"flightNumber":"123","date":"2025-11-17","filedBy":"Pilot"}'
```
- Fetch checklist:
```bash
curl http://localhost:5000/api/checklist
```
- Update checklist item:
```bash
curl -X PUT http://localhost:5000/api/checklist/2 \
  -H "Content-Type: application/json" \
  -d '{"status":"Completed","comment":"OK"}'
```

Key response shapes (examples)
- Flight info object:
```json
{ "id":1, "flightNumber":"123", "flightDate":"2025-11-17T08:57:05Z", "filedBy":"Pilot" }
```
- Checklist item:
```json
{ "id":2, "check":"WINDY DATA...","status":"Completed","comment":"Wind OK" }
```

Status codes & errors
- `200` OK — success
- `400` Bad Request — validation error (e.g., missing `flightNumber` on PUT)
- `404` Not Found — invalid checklist id
- `500` Internal Server Error — file I/O or server failure

Error body (all):
```json
{ "error": "Descriptive message" }
```

Validation notes
- `PUT /api/flight-info` requires `flightNumber` (non-empty string)
- `PUT /api/checklist/{id}` requires valid `id` and `status` (allowed: `--`, `Pending`, `Completed`, `Not Required`)

Tips
- Files under `backend/data/` must be UTF-8 without BOM to avoid parse errors.
- For local dev, set `VITE_API_BASE_URL` (frontend) to `http://localhost:5000`.

If you'd like, I can shorten further to a single page README-style quick reference or split this into `API_QUICK.md` and `API_EXAMPLES.md`.
