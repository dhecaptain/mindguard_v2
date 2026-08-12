# MindGuard Runbook

Operational guide for the consent-first FastAPI + React product. The legacy
Streamlit prototype is covered by `README.md`; this document is about the
current stack: `backend/`, `frontend/`, and `marketing/`.

---

## 1. Architecture at a glance

```
marketing/ (Next.js 14, Vercel)
    └── /api/*  ──rewrite──▶  backend (FastAPI, Railway)

frontend/ (React + Vite SPA)
    └── /api/v1/*  ──▶  backend (FastAPI)

backend/ (FastAPI, SQLite)
    ├── auth (JWT + Supabase Google OAuth)
    ├── consent workflow (signed tokens, audit trail, maintenance loop)
    ├── roster ingestion (CSV → encrypted PII)
    ├── analysis (ML model, consent-gated)
    └── demo request pipeline
```

Data stores: one SQLite database (`mindguard.db`) plus the `email_events` /
`consent_events` / `audit_log` append-only trails.

---

## 2. Environment

Copy `.env.example` → `.env`. Key variables:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Signing secret for MindGuard JWTs |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Supabase project (Google OAuth) |
| `ENCRYPTION_KEY` | 64-hex AES-256-GCM key for student PII at rest |
| `RESEND_API_KEY` | Preferred email provider |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP fallback (e.g. Gmail app password) |
| `EMAIL_FROM` | Sender header, e.g. `MindGuard <noreply@mindguard.ai>` |
| `DEMO_NOTIFY_EMAIL` | Where demo request notifications are sent |
| `APP_BASE_URL` | Public URL used in consent/demo email links |
| `ENFORCE_CONSENT_ANALYSIS` | `true` = analysis blocked without active consent |
| `CONSENT_EXPIRY_DAYS` | Accepted consent validity (default `30`) |
| `CONSENT_REMINDER_DAYS` | Comma list of reminder days (default `3,7`) |
| `MINDGUARD_DB_DIR` | Directory for `mindguard.db` (default: repo root) |
| `LOG_LEVEL` | Root log level, e.g. `INFO`/`DEBUG` (default `INFO`) |
| `SECRETS_FILE_DIR` | Optional dir of secret files named after each secret (12-factor) |
| `<NAME>_FILE` | Optional single-file source for a secret, e.g. `JWT_SECRET_FILE` |
| `MINDGUARD_CSP` | Set `false` to disable CSP/security headers (default `true`) |

Secrets are resolved through `backend/secrets_manager.py` (`get_secret`): env
vars, `<NAME>_FILE`, then `SECRETS_FILE_DIR`. Swapping to a secret manager
(AWS Secrets Manager, vault) is registering a loader there — a config change,
not a code change (Delivery Brief §11).

Generate keys:

```bash
python -c "import secrets; print(secrets.token_hex(32))"   # JWT_SECRET / ENCRYPTION_KEY
```

---

## 3. Local development

### Backend

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
PYTHONPATH=backend uvicorn backend.main:app --reload --port 8000
```

API: http://localhost:8000 · docs: http://localhost:8000/docs
Health probe: http://localhost:8000/api/v1/healthz

> The ML stack (`torch`/`transformers`) is imported lazily on first inference,
> so `backend.main` imports in ~1s without it — the test suite and boot never
> need torch. Install `backend/requirements.txt` only to actually run analysis.

**Schema migrations.** The schema is versioned with Alembic
(`backend/alembic/`, baseline `0001`). `init_db()` runs `alembic upgrade head`
automatically on startup, so normal boots need no manual step. To inspect or
drive migrations manually:

```bash
cd backend && PYTHONPATH=..:. alembic upgrade head   # idempotent
cd backend && PYTHONPATH=..:. alembic history        # applied revisions
```

**Logging.** All logs are single-line JSON on stdout, with per-request
correlation (`request_id`, `method`, `path`, `status_code`, `duration_ms`,
`user_id`, `ip`). Every request emits one `http <METHOD> <path> -> <status>`
access line. Set `LOG_LEVEL` to raise/lower verbosity; the root logger is
configured by `backend/logging_setup.py` (no Alembic log config).

**Security headers (Brief §8).** Every response gets
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and
`Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`.
HTML documents (the SPA served at `/`) additionally get a Content-Security-Policy
(no inline scripts, Google Fonts + Tabler CDN allowed, Supabase for OAuth,
`blob:` for downloads); `/docs`, `/redoc` and `/openapi.json` are exempt so
Swagger UI keeps working. Pinned by `tests/test_security_headers.py`. Toggle
everything off with `MINDGUARD_CSP=false` if a proxy already sets these.

### Frontend

```bash
cd frontend && npm install && npm run dev     # http://localhost:5173
```

### Marketing site

```bash
cd marketing && npm install && npm run dev    # http://localhost:3000
```

The marketing demo form proxies to the backend via
`MINDGUARD_API_URL` (default `http://localhost:8000`).

Marketing pages (Delivery Brief §5.2): `/`, `/product`, `/for-schools`,
`/for-universities`, `/pricing`, `/docs` (+ `/docs/roster-csv`, `/docs/faq`),
`/security`, `/about`, `/blog` (+ 3 seed posts), `/demo`, `/contact`,
`/privacy`, `/terms`, `/dpa` (PDF at `/dpa-template.pdf`), `/thank-you`.
`robots.txt` and `sitemap.xml` are generated automatically.

---

## 4. Core workflows

### Consent lifecycle

1. **Roster upload** — admin uploads a CSV (`student_id, first_name,
   last_name, email[, date_of_birth, grade_level, parent_email]`) to
   `POST /api/v1/admin/roster/upload`. Missing DOB ⇒ treated as a minor.
2. **Dispatch** — counsellor sends a consent request; a signed one-time token
   (`v1.nonce.mac.cid`) is emailed (Resend, SMTP fallback).
3. **Response** — recipient opens the portal (`/consent/<token>`, capped at 20
   views), accepts/declines; the event is appended to `consent_events`.
4. **Enforcement** — `POST /api/v1/students/{id}/analyze` requires an active
   (accepted, non-expired, non-revoked) consent when
   `ENFORCE_CONSENT_ANALYSIS=true`.
5. **Maintenance** — hourly loop (and `POST /api/v1/admin/consents/run-maintenance`)
   expires stale consents and sends day-3/day-7 reminders.

### Demo request pipeline

`POST /api/v1/demo-requests` (public, rate-limited to 5/hour/IP) creates a
request, emails the requester a confirmation, and emails `DEMO_NOTIFY_EMAIL` a
notification. Admins manage statuses in the Admin Panel.

### Audit trail

Terms acceptance, registration, consent events, roster uploads and demo
updates all write to `audit_log`. Admins see the compliance trail in the Admin
Panel and via `GET /api/v1/admin/audit`.

---

## 5. Verification

```bash
# Backend tests (no torch required)
PYTHONPATH=backend python -m pytest backend/tests -q

# Frontend type-check + build
cd frontend && npx tsc -b && npm run build

# Marketing build
cd marketing && npm run build
```

### Consent gate manual check

```bash
# Without consent → 403
curl -X POST http://localhost:8000/api/v1/students/<id>/analyze \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"text":"hello"}'
```

### OpenAPI contract

The generated spec is the migration contract between the current backend and
the Phase 2 target (Brief §11). Pinned by `tests/test_openapi_contract.py`;
regenerate the artifact with:

```bash
cd backend && PYTHONPATH=..:. python3 scripts/export_openapi.py  # → openapi.json
```

### Health probe

```bash
curl http://localhost:8000/api/v1/healthz
# {"status":"ok","version":"2.0.0","db":{"db":"ok","tables":N}}
```

### Load contract (Brief §9.5)

1000-row roster upload must preview and commit in under 5s. Pinned by
`tests/test_load_roster.py`:

```bash
cd backend && PYTHONPATH=..:. python3 -m pytest tests/test_load_roster.py -q
```

For a wall-clock preview measurement, time the API from the admin UI
(Roster → upload a generated 1000-row CSV → preview) and confirm the UI
renders the preview in well under 5s.

### Accessibility (Brief §9.6)

The e2e suite runs axe-core scans (WCAG 2.0/2.1 A+AA) on the consent portal
(pre- and post-action) and the marketing demo form, asserting zero violations:

```bash
cd frontend && npm run test:e2e
```

`@axe-core/playwright` is a devDependency (e2e only); no runtime bundle impact.

---

## 6. Deploying

- **Backend** — Railway (`railway.toml`). The Dockerfile builds the Vite
  frontend and serves `dist/` from FastAPI, so one Railway service runs both.
  Never commit `.env`.

### Railway environment variables

Set these in the Railway service dashboard (Variables):

| Variable | Value |
| --- | --- |
| `MINDGUARD_DB_DIR` | **`/app/data`** — keeps `mindguard.db` + `.encryption_key` on the persistent volume |
| `ENCRYPTION_KEY` | 64-hex secret — `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_SECRET` | rotate before launch — `secrets.token_hex(32)` |
| `APP_BASE_URL` | `https://<your-app>.up.railway.app` (consent/demo email links) |
| `EMAIL_FROM` | `MindGuard <noreply@mindguard.ai>` (must match the ESP sender domain) |
| `DEMO_NOTIFY_EMAIL` | inbox for demo-request notifications |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Google OAuth (returned by `/api/config`) |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173,https://<marketing-domain>` |
| `MINDGUARD_CSP` | leave unset (`true`); set `false` only if a proxy sets CSP |
| `HF_CACHE_DIR` | `/tmp/huggingface` (already set in Dockerfile) |
| `LOG_LEVEL` | `INFO` |

Email provider — one of:
- **Resend** (preferred): `RESEND_API_KEY`.
- **SMTP** fallback: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`.

Verify delivery after configuring:

```bash
cd backend && PYTHONPATH=..:. python3 scripts/test_email.py you@example.com
```

### Memory: the ML model needs a paid plan

The full-weight RoBERTa model plus `torch`/`transformers` needs ~2 GB RAM. The
free tier caps services at **0.5 GB and 1 vCPU**, so first inference crashes the
worker. On a paid plan set the service to **≥ 2 GB / 2 vCPU** (and a 512 MB swap
if the platform allows it). During the free trial, analysis will still crash —
use it only for the consent/demo/marketing flows, not inference.

### Data persistence

Attach a **volume** at `/app/data` and set `MINDGUARD_DB_DIR=/app/data` so the
SQLite DB and the encryption key survive redeploys. Note: **on the free tier,
volume data is deleted 30 days after the trial expires** — real data requires a
paid plan (Hobby includes 5 GB volume storage).

### Backups

Nightly snapshot (keeps 7 by default; uploads to S3-compatible storage if
`BACKUP_S3_BUCKET` is set):

```bash
cd backend && PYTHONPATH=..:. python3 scripts/backup_db.py /var/backups/mindguard
```

Restore — stop the app, replace the DB, restart:

```bash
gunzip -c mindguard-<stamp>.db.gz > mindguard.db   # into MINDGUARD_DB_DIR
```

Pinned by `tests/test_backup_script.py`.

### Consent email deliverability (SPF/DKIM/DMARC)

All transactional email (consent requests, reminders, demo replies) is sent
through **Resend** (`email_sender.py`). Before go-live, complete DNS
authentication on the sending domain so consent links land in the inbox rather
than spam:

1. **SPF** — in DNS add a TXT record for the sending domain:
   `v=spf1 include:amazonses.com ~all` (Resend uses Amazon SES; follow the exact
   value Resend shows under *Domains* for your account).
2. **DKIM** — add the TXT records Resend provides (`sendgrid._domainkey` or
   Resend's generated selectors). Verify both SPF and DKIM show **Verified** in
   the Resend dashboard.
3. **DMARC** — add `_dmarc.<sending-domain>` TXT:
   `v=DMARC1; p=none; rua=mailto:dmarc@<your-domain>; pct=100`. Start at
   `p=none`, review aggregate reports, then tighten to `p=quarantine`.
4. Set `EMAIL_FROM` to a verified sender on the authenticated domain, e.g.
   `MindGuard <noreply@<your-domain>>` (never a personal Gmail — the app logs a
   warning and consumers will bounce). `RESEND_API_KEY` must be set (see §2).
5. **Verify** with [mail-tester.com](https://www.mail-tester.com) — send a
   consent request to a throwaway address and aim for **≥ 9/10**. Warm up
   sending volume gradually if the domain is new (see `brief.txt` for the full
   deliverability plan).

The backend webhook secret (`RESEND_WEBHOOK_SECRET`) must also be set — see
`.env.example`. Delivery events (delivered/bounced/complained) flow through
`POST /webhooks/email/resend` and are recorded in `email_events`.

### Paid upgrade (Hobby, $5/mo) — steps

1. Billing → Upgrade to **Hobby**.
2. Service → Settings → Volume: add volume, mount path `/app/data` (5 GB included).
3. Set `MINDGUARD_DB_DIR=/app/data` and redeploy (fresh DB reseeds demo users).
4. Settings → Deploy → **disable Serverless** so inference isn't interrupted by
   cold starts; set **RAM ≥ 2 GB / vCPU ≥ 2**.
5. Custom domain: add e.g. `app.mindguard.ai` + TLS, then update `APP_BASE_URL`,
   Supabase redirect URLs, Google OAuth authorized redirects/origins, and
   `CORS_ORIGINS` to match.
6. Keep the **marketing site** on free Serverless (low traffic) to save cost.

### Other services

- **Marketing** — deploy `marketing/` to Vercel; set `MINDGUARD_API_URL` to the
  public backend URL and add the Vercel origin to `CORS_ORIGINS`. Add the
  reCAPTCHA v3 **site key** to the demo form and `RECAPTCHA_SECRET` to the
  backend once enrolled.

---

## 7. Go-live checklist

- [ ] Railway volume attached at `/app/data`, `MINDGUARD_DB_DIR=/app/data`
- [ ] `ENCRYPTION_KEY` set to a real 64-hex secret (not the dev auto-key)
- [ ] `JWT_SECRET` rotated
- [ ] `RESEND_API_KEY` (or SMTP) configured and `scripts/test_email.py` delivered
- [ ] `DEMO_NOTIFY_EMAIL` set
- [ ] `APP_BASE_URL` points at the public app
- [ ] Google OAuth callback + redirect URLs verified
- [ ] Service RAM ≥ 2 GB (analysis does not crash)
- [ ] Nightly backup scheduled (cron/`railway cron` → `scripts/backup_db.py`)
- [ ] `/api/v1/healthz` responds `ok`
- [ ] Full backend test suite green
- [ ] Roster upload → consent dispatch → accept → analysis verified end-to-end
