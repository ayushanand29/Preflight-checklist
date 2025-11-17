# Preflight Checklist Application - Requirements Analysis

## 1. Project Overview

The Preflight Checklist application is a web-based tool designed to streamline pre-flight operations for UAV (Unmanned Aerial Vehicle) missions. It provides a structured interface for pilots to:
- Record flight information and metadata
- Systematically verify critical pre-flight checks
- Track check status and add comments
- Persist data for audit and compliance purposes

---

## 2. Key Functionalities

### 2.1 Flight Information Management
**Purpose:** Capture and store essential flight metadata before each mission

**Core Features:**
- **Flight Number Input:** Editable text field to enter/retrieve flight identifier
- **Auto-Population:** Blur event on Flight Number field fetches associated flight data from backend
- **Flight Details Fields:**
  - Flight Number (auto-populated after lookup)
  - Date (formatted ISO timestamp)
  - Filed By (pilot/operator name)
  - Filing Time (submission timestamp)
  - Departure Location
  - Departure Time
  - Arrival Location
  - Estimated Arrival Time

**Interaction Flow:**
1. User enters Flight Number and leaves the field (blur)
2. Frontend fetches `GET /api/flight-info?flightNumber={value}` from backend
3. API returns complete flight record
4. All fields populate with retrieved data
5. User can manually edit any field
6. Manual "Save Flight Info" button persists all changes via `PUT /api/flight-info`

**Data State Management:**
- Flight info stored in React state (`flightInfo`)
- Edit mode tracked per field (`editingFlightField`)
- No auto-save on blur; only manual save button persists to backend

---

### 2.2 Preflight Checks Management
**Purpose:** Systematically track completion of critical pre-flight checks

**Core Features:**
- **Predefined Check List:** 8 standard preflight checks including:
  - Digital Sky airspace clearance verification
  - WINDY data collection at multiple altitudes
  - Anemometer wind speed and direction check
  - Aircraft power-up confirmation
  - Mission selection and validation
  - Mission write and read verification
  - UAV and waypoint heading alignment
  - Waypoint numbering and altitude validation

- **Per-Check Actions:**
  - **Status Dropdown:** Three states
    - `--` (default/unselected)
    - `Pending` (not yet completed)
    - `Completed` (verified and passed)
    - `Not Required` (skip for this mission)
  - **Comment Field:** Free-text notes for each check (e.g., "Wind speed 5 m/s, within limits")
  - **Edit/Save Button:** Toggle between view and edit modes per row

**Interaction Flow:**
1. User clicks "Edit" button on a checklist row
2. Status dropdown and comment field become editable
3. User selects status and enters comments
4. User clicks "Save" button for that row
5. Frontend sends `PUT /api/checklist/{id}` with updated status and comment
6. Backend persists changes and returns updated record
7. UI updates and exits edit mode

**Data Persistence:**
- Checklist items fetched via `GET /api/checklist` on app load
- Individual check updates via `PUT /api/checklist/{id}`
- State managed per check with `items` array and `editingId` tracking

---

### 2.3 Data Persistence & Backend Integration

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/flight-info` | GET | Retrieve all flight info or lookup by query param |
| `/api/flight-info` | PUT | Update/save flight information |
| `/api/checklist` | GET | Fetch all predefined checks |
| `/api/checklist/{id}` | PUT | Update a specific check's status/comment |

**Data Files (Backend Storage):**
- `backend/data/flight-info.json` — Flight metadata
- `backend/data/checklist.json` — Predefined checks (template)

---

## 3. User Interface & Interaction Requirements

### 3.1 Layout & Structure

```
┌─────────────────────────────────────────┐
│     PRE-FLIGHT CHECKLIST (Title)        │
├─────────────────────────────────────────┤
│                                         │
│  FLIGHT NUMBER: [_____________]         │
│         DATE:   [2025-11-17]           │
│                                         │
├──────────┬──────────┬──────────┬────────┤
│ Filed By │ Qwe      │ Filing Time │ Vvxcv  │
├──────────┼──────────┼──────────┼────────┤
│ Departure│ Ddd      │ Departure  │ Xcv    │
│ Location │          │ Time       │        │
├──────────┼──────────┼──────────┼────────┤
│ Arrival  │ Xvxvv    │ Est. Arrival│ ----   │
│ Location │          │ Time       │        │
└──────────┴──────────┴──────────┴────────┘
                                  [Save Flight Info]

Preflight Checks
┌───────────────────┬──────────┬────────────┬────────┐
│ CHECKS            │ STATUS   │ COMMENT(S) │ ACTION │
├───────────────────┼──────────┼────────────┼────────┤
│ Check 1: Digital  │ ----     │            │ Edit   │
│ Sky airspace      │          │            │        │
├───────────────────┼──────────┼────────────┼────────┤
│ Check 2: WINDY    │ Completed│ Wind 5 m/s │ Edit   │
│ DATA - at 0m, 100m│          │            │        │
└───────────────────┴──────────┴────────────┴────────┘
```

### 3.2 User Interactions

#### Flight Information Section
- **Flight Number Field (Always Visible Input):**
  - User types flight number
  - On blur: auto-fetches flight data and populates all fields
  - No immediate save; data only saved via Save button

- **Date & Other Fields (Click-to-Edit):**
  - Click on field to enter edit mode
  - Input appears; user can modify
  - Blur or Tab exits edit mode without saving
  - Save only via "Save Flight Info" button

- **Save Flight Info Button:**
  - Manual trigger to persist all flight info changes
  - Sends complete `flightInfo` object to backend
  - Displays success/error feedback

#### Checklist Section
- **View Mode (Default):**
  - Each check shows: name, status, comment
  - "Edit" button visible

- **Edit Mode (After clicking Edit):**
  - Status becomes a dropdown selector
  - Comment becomes a text input
  - "Save" button replaces "Edit"
  - Click "Save" → sends PUT request
  - UI returns to view mode with updated data

---

## 4. Technical Requirements

### 4.1 Frontend (React)
- **Framework:** React with Vite build tool
- **State Management:** React hooks (`useState`, `useEffect`)
- **HTTP Client:** Axios for API calls
- **Data Loading:** Parallel API calls using `Promise.all()`
- **Testing:** Jest + React Testing Library

### 4.2 Backend (Node.js/Express)
- **Framework:** Express.js
- **Data Storage:** File-based JSON persistence
- **API Design:** RESTful endpoints with proper HTTP methods
- **Testing:** Jest + Supertest for integration tests
- **Deployment:** Docker containerization

### 4.3 Containerization & Orchestration
- **Docker:** Separate images for frontend and backend
- **Docker Compose:** Multi-service orchestration
- **Volumes:** File-based data persistence

---

## 5. Data Models

### 5.1 Flight Info Object
```javascript
{
  id: 1,
  flightNumber: "123",
  flightDate: "2025-11-17T08:57:05.944Z",
  filedBy: "qwe",
  filingTime: "vvxcv",
  departureLocation: "ddd",
  departureTime: "xcv",
  arrivalLocation: "xvxvv",
  arrivalTime: null,
  date: "2025-11-17T08:57:05.944Z"
}
```

### 5.2 Checklist Item Object
```javascript
{
  id: 1,
  check: "Check Digital Sky for airspace clearance",
  status: "Completed", // "--", "Pending", "Completed", "Not Required"
  comment: "Airspace cleared for mission"
}
```

---

## 6. Error Handling & Edge Cases

### 6.1 Flight Number Lookup
- **Empty input:** Skip fetch if flight number is blank
- **No match found:** Display user-entered flight number; keep existing fields
- **Network error:** Console log error; retain current state

### 6.2 Checklist Operations
- **Save failure:** Display error message; remain in edit mode
- **Data loss:** Prevent navigation without save confirmation (optional enhancement)

### 6.3 Field Validation
- **Flight info fields:** Allow free-text input; backend enforces business rules
- **Status dropdown:** Constrain to predefined values only

---

## 7. Future Enhancements

1. **User Authentication:** Multi-user support with role-based access
2. **Flight History:** Archive and audit trail of previous flights
3. **Real-time Collaboration:** Multiple pilots working on same checklist
4. **Mobile Responsiveness:** Optimize layout for tablets/phones
5. **Export Functionality:** PDF or CSV reports of completed checklists
6. **Notifications:** Email/SMS alerts for incomplete checks
7. **Weather Integration:** Auto-fetch weather from WINDY API
8. **Digital Signatures:** Signature capture for compliance
9. **Offline Mode:** Cache data and sync when online
10. **Analytics Dashboard:** Aggregate metrics (check pass rate, mission duration, etc.)

---

## 8. Acceptance Criteria

### Flight Information Management
- ✅ User can enter Flight Number and blur to auto-populate all fields
- ✅ User can manually edit any populated field
- ✅ "Save Flight Info" button persists all changes to backend
- ✅ Flight Number is included when saving (never null)
- ✅ Data survives page reload

### Checklist Management
- ✅ All 8 predefined checks load on app start
- ✅ User can click "Edit" to modify status and comment
- ✅ Status field restricted to predefined values
- ✅ Blur exits edit mode without saving
- ✅ "Save" button persists changes per row
- ✅ Backend returns updated record after save

### API & Data Persistence
- ✅ Flight info endpoint supports query parameter lookup
- ✅ Checklist endpoint returns all checks on load
- ✅ PUT endpoints accept and persist updates
- ✅ File-based JSON storage is UTF-8 encoded without BOM

### Testing & Quality
- ✅ Backend API tests cover CRUD operations
- ✅ Frontend unit tests verify state updates
- ✅ No console errors or warnings in production build
- ✅ Docker build and compose orchestration work without errors

---

## 9. Success Metrics

- **Usability:** All interactions complete in < 3 clicks
- **Performance:** API responses < 200ms
- **Reliability:** 100% data persistence across restarts
- **Maintainability:** Code covered by automated tests (>70% coverage)
- **Deployment:** Full stack deployable via single `docker-compose up` command
