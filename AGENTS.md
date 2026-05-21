# Setup Guide

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
