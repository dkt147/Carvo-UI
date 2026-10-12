# CARVO Web App — Role-Based UI

A unified, role-based web application that serves both Admin/Reviewer and Minister workspaces. Uses a single configurable backend URL with automatic route protection and role-based UI rendering.

---

## Configuration & Setup

### Environment Setup

Create or update `.env` in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note:** Change only this value when the backend URL changes. API modules have no hard-coded URLs.

### Installation & Run

```bash
npm install
npm run dev
```

The app will be available at: `http://localhost:5173/`

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│       Frontend (HTML/JS)                │
│  ├─ index.html (Login entry)           │
│  ├─ admin/index.html (Admin dashboard) │
│  └─ minister/index.html (Minister UI)  │
└──────────────┬──────────────────────────┘
               │
         ┌─────▼────────────────┐
         │  auth-guard.js       │ ◄─ Checks auth & redirects
         │  role-ui.js          │ ◄─ Renders user info
         └─────┬────────────────┘
               │
         ┌─────▼──────────────────────┐
         │  API Layer (src/api/)      │
         ├─ client.js (Base HTTP)    │
         ├─ auth.api.js (Login)      │
         ├─ admin.api.js (Admin ops) │
         └─ minister.api.js (Minister ops)
               │
         ┌─────▼─────────────────┐
         │  Backend API Server   │
         │  (/auth, /admin, ...) │
         └───────────────────────┘
```

---

## Core Modules & Flow

### 1. **auth-guard.js** — Route Protection & Authentication Check

**Purpose:** Ensures only authenticated users access the app; routes users based on their role.

**Flow:**
1. On page load, checks for token & user in localStorage
2. If no token → redirects to `/login.html`
3. If logged in on login page → redirects to role-specific home
4. If ADMIN/REVIEWER tries to access `/minister/` → redirects to `/admin/`
5. If MINISTER tries to access `/admin/` → redirects to `/minister/`

**Key Function:**
- `logoutAndGoToLogin()` — Clears session and returns to login

---

### 2. **role-ui.js** — User Info & Sign-Out UI

**Purpose:** Displays authenticated user's name, role, and a sign-out button.

**Flow:**
1. Fetches current user from localStorage (via `getCurrentUser()`)
2. Creates a fixed-position widget in top-right corner
3. Shows: `{user.name} · {user.role}`
4. Provides "Sign out" button that calls `logoutAndGoToLogin()`
5. Widget only appears if user is authenticated

---

## API Modules (src/api/)

### **client.js** — Base HTTP Client

**Purpose:** Centralized API communication with token management and error handling.

**Key Functions:**
- `apiRequest(path, options)` — Makes HTTP requests with auto-attached bearer token
- `getToken()` — Retrieves JWT from localStorage
- `getCurrentUser()` — Retrieves cached user object
- `setSession({ token, user })` — Stores token & user after login
- `clearSession()` — Removes session on logout
- `API_URL` — Exported API base URL from environment

**Configuration:**
- Reads `VITE_API_URL` from environment
- Auto-attaches `Authorization: Bearer {token}` header
- Handles JSON/text responses
- On 401 → auto-clears session

**Error Handling:**
- If request fails: throws error with `.status` and `.payload` properties
- On 401: automatically clears session to prevent stale auth

---

### **auth.api.js** — Authentication

**Purpose:** Login/logout and session management.

**Endpoints:**

| Function | Method | Endpoint | Input | Output |
|----------|--------|----------|-------|--------|
| `login(email, password)` | POST | `/auth/login` | `{email, password}` | `{id, name, email, role, ...}` |
| `logout()` | — | — | — | Clears session |

**Expected Response (from backend):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "ADMIN" | "REVIEWER" | "MINISTER"
    },
    "token": "JWT_TOKEN"
  }
}
```

**Flow:**
1. Call `login(email, password)`
2. Backend validates credentials, returns JWT + user
3. `setSession()` auto-called to store token & user
4. Redirect happens in `auth-guard.js`

---

### **admin.api.js** — Admin Dashboard & Management

**Purpose:** All admin operations: documents, knowledge, reviews, protocols, users, audit logs, settings, and notifications.

#### **Dashboard**
- `getAdminDashboard()` — Fetch admin dashboard data

#### **Documents** (versioned text documents)
- `getDocuments()` — List all documents
- `getDocument(id)` — Get single document details
- `createDocument(body)` — Create new document → `{title, description, ...}`
- `createDocumentVersion(id, content)` — Create new version
- `updateDocumentStatus(id, status)` — Change status (e.g., "DRAFT" → "PUBLISHED")

#### **Knowledge** (extracted or manually created knowledge items)
- `getKnowledge(filters)` — List with optional filters: `{approvalStatus, type, documentId}`
- `getKnowledgeById(id)` — Get single item
- `createKnowledge(body)` — Create new knowledge item
- `updateKnowledge(id, body)` — Update existing item
- `deleteKnowledge(id)` — Delete item

#### **Reviews** (workflow: document → knowledge extraction → review → approval)
- `getReviews(status)` — List reviews; filter by status ("ALL", "PENDING", "APPROVED", etc.)
- `getReview(id)` — Get review details with clarification questions & feedback
- `createReview(body)` — Start new review
- `updateReview(id, body)` — Update review
- `answerClarification(id, answer)` — Answer a clarification question from reviewer
- `requestReviewChanges(id, correction, question)` — Ask reviewer for changes + clarification
- `approveReview(id, knowledgeItems)` — Approve review and finalize knowledge items
- `rejectReview(id, correction)` — Reject review with correction notes

#### **Protocols** (versioned decision protocols)
- `getProtocols()` — List all protocols
- `getProtocol(id)` — Get protocol details
- `createProtocol(body)` — Create new protocol
- `updateProtocol(id, body)` — Update protocol
- `updateProtocolStatus(id, status)` — Change status
- `createProtocolVersion(id, content)` — Create new version
- `getProtocolVersions(id)` — List all versions
- `linkKnowledge(protocolId, versionId, knowledgeItemId)` — Link knowledge to protocol version
- `unlinkKnowledge(protocolId, versionId, knowledgeId)` — Unlink knowledge from protocol

#### **AI & Analysis**
- `getAnalyses()` — List completed analyses
- `getAnalysis(id)` — Get analysis details
- `getAiJobs()` — List AI analysis jobs (async background tasks)
- `getAiJob(id)` — Get job status and results

#### **User Management**
- `getUsers()` — List all users
- `getUser(id)` — Get user details
- `createUser(body)` — Create user → `{email, name, role, ...}`
- `updateUser(id, body)` — Update user info/role

#### **Audit & Settings**
- `getAuditLogs()` — List all audit log entries (who did what, when)
- `getAuditLog(id)` — Get single log entry
- `getSettings()` — Get system-wide settings

#### **Notifications** (account-scoped)
- `getNotifications()` — List all notifications for logged-in user
- `getUnreadNotificationCount()` — Get count of unread notifications
- `markNotificationAsRead(id)` — Mark single notification as read
- `markAllNotificationsAsRead()` — Mark all as read at once

---

### **minister.api.js** — Minister Workspace

**Purpose:** Stakeholder/Minister workflow: situational analysis, action planning, protocol consultation, and feedback.

#### **Situations** (current operational scenarios)
- `getMinisterSituations()` — List all situations
- `createMinisterSituation({title, description})` — Create new situation

#### **Actions** (tasks, decisions, assignments)
- `getMinisterActions()` — List all actions
- `createMinisterAction({title, description, dueDate, situationId, recommendationId})` — Create action
- `updateMinisterActionStatus(id, status)` — Update action status

#### **Projects** (initiative containers)
- `getMinisterProjects()` — List all projects

#### **Protocols** (reference guidelines for decisions)
- `getMinisterProtocols()` — List all accessible protocols
- `getMinisterProtocol(protocolId)` — Get protocol details
- `getMinisterProtocolVersions(protocolId)` — Get protocol versions

#### **Analysis & Recommendations** (AI-powered suggestions)
- `requestMinisterAnalysis(situationId, {projectId, protocolVersionId})` — Request AI analysis (async job)
- `getMinisterAnalysisJob(jobId)` — Check analysis job status
- `getMinisterAnalysis(analysisId)` — Get completed analysis
- `getMinisterRecommendations(analysisId)` — Get recommendations from analysis
- `getMinisterSituationAnalyses(situationId)` — List all analyses for a situation

#### **Results & Feedback** (outcomes and improvement input)
- `getMinisterResults()` — List all results/outcomes
- `getMinisterFeedback()` — List all feedback entries
- `getMinisterEvents()` — List all events (timeline of changes)

#### **Notifications** (account-scoped)
- `getMinisterNotifications()` — List notifications for minister
- `getMinisterUnreadNotificationCount()` — Get unread count
- `markMinisterNotificationAsRead(id)` — Mark as read
- `markAllMinisterNotificationsAsRead()` — Mark all as read
- `deleteMinisterNotification(id)` — Delete notification

#### **Composite Endpoint**
- `getMinisterDashboard()` — Fetches all above data in parallel:
  ```json
  {
    "situations": [...],
    "actions": [...],
    "projects": [...],
    "protocols": [...],
    "notifications": [...],
    "unreadNotifications": 5,
    "analyses": [...],
    "results": [...],
    "feedback": [...],
    "events": [...]
  }
  ```

---

## Authentication Flow

```
┌──────────────┐
│  Login Page  │
│ (index.html) │
└──────┬───────┘
       │ User enters email + password
       ▼
┌─────────────────────────┐
│ auth.api.login()        │ POST /auth/login
│ (with email, password)  │
└──────┬──────────────────┘
       │
       ▼ ✓ Backend validates
┌──────────────────────────┐
│ setSession(token, user)  │
│ (localStorage)           │
└──────┬───────────────────┘
       │
       ▼ auth-guard.js checks role
┌──────────────────────┐
│ /admin/index.html    │ (if ADMIN/REVIEWER)
│ OR                   │
│ /minister/index.html │ (if MINISTER)
└──────────────────────┘
```

---

## Data Flow: Admin Workflow Example

```
1. Admin View Page: /admin/index.html
   │
   ├─► getAdminDashboard() ──► API request with Bearer token
   │
   ├─► getDocuments()
   │
   └─► getNotifications()

2. Admin Opens Document:
   │
   ├─► getDocument(id)
   │
   └─► getProtocolVersions(id) [if linking protocols]

3. Admin Reviews & Approves:
   │
   ├─► getReview(id) [fetch review with Q&A]
   │
   ├─► answerClarification(id, answer) [or requestReviewChanges]
   │
   └─► approveReview(id, knowledgeItems) [finalize]

4. Admin Manages Users:
   │
   ├─► getUsers()
   │
   └─► updateUser(id, {email, role, ...})
```

---

## Data Flow: Minister Workflow Example

```
1. Minister View Dashboard: /minister/index.html
   │
   └─► getMinisterDashboard()
       [All key data fetched in parallel]

2. Minister Creates Situation:
   │
   └─► createMinisterSituation({title, description})

3. Minister Requests Analysis:
   │
   ├─► requestMinisterAnalysis(situationId, {protocolVersionId})
   │   [async, returns jobId]
   │
   └─► Poll getMinisterAnalysisJob(jobId) until done
       [When ready: getMinisterRecommendations(analysisId)]

4. Minister Creates Action from Recommendation:
   │
   └─► createMinisterAction({...., recommendationId})

5. Minister Checks Notifications:
   │
   ├─► getMinisterNotifications()
   │
   ├─► markMinisterNotificationAsRead(id)
   │
   └─► getMinisterUnreadNotificationCount()
```

---

## Error Handling

All API calls throw errors with:
- `.status` — HTTP status code (401, 404, 500, etc.)
- `.payload` — Backend error response (if JSON)
- `.message` — Human-readable error message

**Special Case: 401 Unauthorized**
- `apiRequest()` auto-clears session
- User remains on current page (auth-guard will redirect on next navigation)
- Next page access redirects to login

---

## Key Design Decisions

1. **No Hard-Coded URLs**: All API calls go through `API_URL` from environment
2. **Auto Token Management**: Token attached to every request in `client.js`
3. **Role-Based Routing**: `auth-guard.js` enforces access rules
4. **Separation of Concerns**: 
   - `auth.api.js` = only login/logout
   - `admin.api.js` = all admin operations
   - `minister.api.js` = all minister operations
5. **Parallel Data Fetching**: `getMinisterDashboard()` uses `Promise.all()` for efficiency
6. **Backward Compatibility**: Legacy `api.js` still present (legacy support)

---

## File Structure

```
src/
├─ api.js                    (Legacy API client)
├─ auth-guard.js             (Route protection)
├─ role-ui.js                (User info widget)
├─ support.js                (Runtime utilities)
├─ carvo-*.dc.html           (Declarative component templates)
└─ api/
   ├─ client.js              (Base HTTP + token management)
   ├─ auth.api.js            (Login/logout)
   ├─ admin.api.js           (Admin operations)
   ├─ minister.api.js        (Minister operations)
   └─ _ds/                    (Design system & styles)
```

---

## Environment & Build

- **Framework**: Vite (vanilla JS, no React/Vue in core)
- **Environment File**: `.env` with `VITE_API_URL`
- **Build**: `npm run build` → `dist/` folder
- **Dev Server**: `npm run dev` → `http://localhost:5173/`

---

## Summary Table

| Component | Purpose | Key Files |
|-----------|---------|-----------|
| **Authentication** | Login & session | `auth.api.js`, `auth-guard.js` |
| **Admin** | Documents, knowledge, reviews, protocols, users | `admin.api.js`, `admin/index.html` |
| **Minister** | Situations, actions, analysis, protocols | `minister.api.js`, `minister/index.html` |
| **HTTP Base** | Token attachment, error handling | `api/client.js` |
| **UI Protection** | Route enforcement & redirects | `auth-guard.js` |
| **User Widget** | Name, role, sign-out | `role-ui.js` |
```

Routing:

- `ADMIN` → `/admin/index.html`
- `REVIEWER` → `/admin/index.html`
- `MINISTER` → `/minister/index.html`

The shared API client automatically sends `Authorization: Bearer <token>` for authenticated API requests.

## Important

The current Admin and Minister screens remain visually intact. This update establishes the frontend authentication/API foundation; feature screens can now be wired module-by-module through `src/api/` without changing the backend URL in individual files.
