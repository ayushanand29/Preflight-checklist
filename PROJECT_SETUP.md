docker-compose restart backend
docker-compose up -d
docker-compose logs -f
docker-compose down
docker-compose logs -f backend
docker build -f backend/Dockerfile -t backend:prod backend/
docker build -f frontend/Dockerfile -t frontend:prod frontend/
docker-compose -f docker-compose.yml build --no-cache
docker-compose ps
docker-compose up -d
docker-compose logs backend
tail -f backend/server.log
docker-compose logs -f backend
docker-compose logs --tail 50 backend
# Project Setup (Short)

This concise guide gets you running quickly with the Preflight Checklist app (frontend + backend).

Prerequisites
- Node.js 18+ and npm
- Git
- (Optional) Docker & Docker Compose for containerized dev

Quick local setup
1. Clone repo
```powershell
git clone https://github.com/ayushanand29/Preflight-checklist.git
cd "Preflight checklist"
```
2. Backend
```powershell
cd backend
npm install
npm start    # starts server on PORT (default 5000)
```
3. Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev  # starts Vite dev server (default 3000)
```
4. Verify
```powershell
curl http://localhost:5000/api/flight-info
start http://localhost:3000
```

Quick Docker setup
```powershell
git clone https://github.com/ayushanand29/Preflight-checklist.git
cd "Preflight checklist"
docker-compose build
docker-compose up -d
docker-compose ps
```

Env variables
- Backend: create `backend/.env` (PORT, NODE_ENV, CORS_ORIGIN, DATA_DIR)
- Frontend: create `frontend/.env` (VITE_API_BASE_URL)

Run tests
- Backend: `cd backend && npm test`
- Frontend: `cd frontend && npm test`

Data files
- `backend/data/flight-info.json`
- `backend/data/checklist.json`
- Important: files must be UTF-8 without BOM to avoid JSON parse errors.

Common troubleshooting
- Port in use: find & kill process (PowerShell: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`).
- CORS errors: set `CORS_ORIGIN=http://localhost:3000` in backend env.
- BOM/JSON errors: re-save file as UTF-8 without BOM.

Useful commands
- Start local servers: backend `npm start`, frontend `npm run dev`
- Docker: `docker-compose up -d`, `docker-compose logs -f`, `docker-compose down`
- Tests: `npm test` in each of `backend` and `frontend`

If you want this shortened further (one-liner quickstart) or expanded into separate `BACKEND_SETUP.md` and `FRONTEND_SETUP.md`, tell me which.
