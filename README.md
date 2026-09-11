# CARVO Web App — Role-Based UI

This UI uses one configurable backend URL and keeps Admin and Minister flows in the same web application.

## API URL

Create/update `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Change only this value when the backend URL changes. API modules do not contain hard-coded backend URLs.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173/
```

## Authentication

Login calls:

```text
POST {VITE_API_URL}/auth/login
```

The backend response is expected in this shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "ADMIN"
    },
    "token": "..."
  }
}
```

Routing:

- `ADMIN` → `/admin/index.html`
- `REVIEWER` → `/admin/index.html`
- `MINISTER` → `/minister/index.html`

The shared API client automatically sends `Authorization: Bearer <token>` for authenticated API requests.

## Important

The current Admin and Minister screens remain visually intact. This update establishes the frontend authentication/API foundation; feature screens can now be wired module-by-module through `src/api/` without changing the backend URL in individual files.
