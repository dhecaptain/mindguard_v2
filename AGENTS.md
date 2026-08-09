# Setup Guide

## Backend environment (`.env`)

The backend loads a `.env` file from the current working directory (via
`python-dotenv` in `backend/config.py` and `backend/auth.py`). Run uvicorn from
the repo root so it picks up the root `.env`:

```bash
cp .env.example .env
# fill in JWT_SECRET and ENCRYPTION_KEY (generate with python -c "import secrets; print(secrets.token_urlsafe(32))")
```

`JWT_SECRET` is required at startup (boot fails without it). The file is
gitignored.

## Google OAuth via Supabase

### Prerequisites
- Supabase Google provider already enabled in Dashboard → Authentication → Providers → Google
- Frontend `.env` and Supabase client already configured

### Google Cloud Console Setup (one-time)

1. Go to https://console.cloud.google.com/apis/credentials
2. Select or create a project (e.g., "MindGuard")
3. **Configure OAuth consent screen**:
   - User Type: External
   - App name: MindGuard
   - Add your email as support/developer contact
   - Add scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`
   - Add test users (your Google email)
4. **Create OAuth 2.0 Client ID**:
   - Application type: Web application
   - Name: MindGuard Web
   - **Authorized redirect URIs**: `https://xbmcszymrlbzzhhyrkom.supabase.co/auth/v1/callback`
   - Click Create
5. Copy **Client ID** and **Client Secret**

### Supabase Dashboard Setup

1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Toggle **Enable** on
3. Paste **Client ID** and **Client Secret** from Google Cloud
4. Under **Redirect URLs**, add: `http://localhost:5173/auth/callback`
5. Save

### Verification

1. Start backend: `source .venv/bin/activate && uvicorn backend.main:app --reload --port 8000`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5173`
4. Click "Sign in with Google" button
5. Authorize with your Google account
6. You should be redirected back and logged in

### How it works

```
User clicks "Sign in with Google"
  → Supabase redirects to Google OAuth
  → User signs in
  → Google redirects to Supabase (callback)
  → Supabase redirects to /auth/callback with session
  → AuthCallbackPage handles redirect:
    1. Gets Supabase session from URL fragment
    2. Posts Supabase access_token to POST /api/auth/google
    3. Backend verifies token via supabase.auth.get_user()
    4. Finds or creates user in SQLite
    5. Returns MindGuard JWT
    6. Frontend stores token in localStorage['mg_token']
    7. User is logged in
```

## Testing

### Backend unit tests (197)

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=..:. python3 -m pytest -q
```

### Admin access & provisioning

- On a **fresh** DB, `seed_defaults()` creates `admin@mindguard.org` using
  `MINDGUARD_ADMIN_PASSWORD` (or a random password logged once — never a known
  default). Demo users keep the "password" password.
- `MINDGUARD_BOOTSTRAP_ADMIN_EMAIL` (comma-separated) promotes existing users to
  admin at startup; each promotion is audit-logged (`USER_PROMOTED`). Unknown
  emails are skipped, accounts are never auto-created.
- Users rotate their own password via `POST /api/auth/change-password`
  (requires the current password; the old token is revoked and the change is
  audit-logged).

### End-to-end (Playwright)

```bash
cd frontend && npm run test:e2e
```

The suite starts its own servers (backend on 8000, vite on 5188, marketing on
3000), seeds a throwaway SQLite DB in `frontend/.e2e-db`, and runs fully
offline (email delivery fails by design and is asserted). 4 tests cover the
consent workflow (roster upload → dispatch → accept/decline → consent-gated
analysis) and the marketing demo-request form.

CI (`.github/workflows/ci.yml`) runs both suites on every push/PR. Note the
backend must be started from the repo root so the root `.env` is picked up.
