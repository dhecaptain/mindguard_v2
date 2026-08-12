# MindGuard v2 — Remediation Plan (Agent Handoff)

> **Purpose**: This file is a living handoff document. Any agent picking up this
> repository should read this first to understand what is built, what is broken,
> and what still needs doing before launch.
>
> **Status convention**: Use `- [ ]` for open items and `- [x]` for completed.
> When you complete an item, tick the box, add a short `> DONE:` note with the
> commit/date, and update this file's generated date at the bottom.
>
> **Audit date**: 2026-08-11 · **Checklist source**: the project action checklist.

---

## 1. Quick context

MindGuard is a student mental-health risk-analysis product with a **consent-first
workflow**. Three surfaces:

| Surface | Stack | Location |
|---|---|---|
| Product app (FastAPI + React SPA) | Python 3.11, FastAPI, SQLite (stdlib `sqlite3`), Alembic, React 19, Tailwind v4, zustand, axios | `backend/`, `frontend/` |
| Marketing site | Next.js 14.2 (App Router), React 18, Tailwind 3.4.6 | `marketing/` |
| Infra config | Railway (`railway.toml`, `Dockerfile.railway`), Render (`render.yaml`), docker-compose | repo root |

Key facts an agent must know before editing:

- **All routes are registered directly on the FastAPI `app` in `backend/main.py`
  (3093 lines).** `backend/routes/` is empty — do not look for route modules.
  Endpoints are under `/api/v1/...`, `/api/...` (auth), `/webhooks/...`.
- **Database is SQLite, not PostgreSQL.** No `DATABASE_URL`, no Redis anywhere.
  `backend/database.py` uses `sqlite3.connect`; schema lives only in Alembic
  migrations (`backend/alembic/versions/0001_baseline.py` is the full schema;
  `0002` adds `analyses.consent_withdrawn_at`; `0003` adds `revoked_tokens`).
  There are **no SQLAlchemy ORM models**; `backend/models/loader.py` is the ML
  model loader, `backend/models/schemas.py` is Pydantic.
- **PII encryption** (AES-256-GCM) exists in `backend/services/crypto.py`. Applied
  to `students`, `consents.recipient_email`, `email_events.recipient_email`, and
  `demo_requests` (`full_name`, `work_email`, `organisation`); audit/consent-event
  JSON payloads are PII-redacted at write. Search/joins use deterministic
  `*_email_hash` columns (see P0-4).
- **Email**: Resend primary, SMTP fallback (`backend/services/email_sender.py`).
  Consent dispatch/state machine: `backend/services/consent_service.py`.
- **Background work** is an in-process asyncio loop (`main.py:303-316`, hourly),
  NOT APScheduler/Celery. There is no email queue.
- **Auth**: Supabase Google OAuth only for login; app issues its own JWT.
  Secrets via `backend/secrets_manager.py`.
- **CI**: `.github/workflows/ci.yml` runs `pytest` (254 unit tests) + Playwright
  (4 e2e tests). No deploy workflow exists.

---

## 2. Audit summary (what's DONE)

These are verified-complete and should NOT be re-built:

- **Consent product (Sprint 1-2)**: roster upload/commit, consent dispatch with
  adult→student / minor→parent+courtesy routing, signed tokens (HMAC-SHA256,
  `crypto.py:119-145`), 9-state lifecycle + revocation, auto-expiry Day 30,
  reminders Day 3/7, `email_events` logging, Resend webhook ingestion,
  demo-request pipeline (reCAPTCHA + honeypot + rate limit + audit), admin
  demo management, consent tracker UI (filters/search/drawer/bulk/export),
  New-Consent modal (single + CSV drop zone), consent gate (server-side 403).
- **Marketing (Sprint 3)**: all 14 pages incl. docs hub, blog ×3, pricing
  (3 tiers), DPA PDF, privacy, terms. Demo form wired to `POST /api/v1/demo-requests`.
- **Testing**: 254 backend unit tests, 4 Playwright e2e tests (consent workflow
  + marketing demo form), axe-core a11y embedded in e2e, 1000-row load test,
  security-header/reCAPTCHA/SSRF/webhook/crypto tests, backup-restore test.
- **Security implemented**: backend CSP (HTML responses), rate limiting
  (in-memory), secrets manager, SSRF guard, strict CORS allowlist.
- **Logging**: structured JSON (`backend/logging_setup.py`), request-id + context.
- **Docs**: `RUNBOOK.md` (deploy, backup/restore, go-live checklist), partial
  `.env.example`, backup script (`backend/scripts/backup_db.py`).

Run the test suites before and after any change:

```bash
# unit (from repo root)
source .venv/bin/activate && cd backend && PYTHONPATH=..:. python3 -m pytest -q

# e2e
cd frontend && npm run test:e2e
```

---

## 3. Open work — prioritized backlog

> P0 = launch-blocking risk. P1 = high impact, needed pre-launch. P2 = medium.
> P3 = ops/polish. Each item lists concrete tasks and how to verify.

### P0 — Launch blockers

#### P0-1 · Consent email deliverability (SPF/DKIM/DMARC)
- [ ] Configure SPF, DKIM, DMARC for the sending domain on the ESP (Resend)
- [ ] Warm up sending volume; verify with mail-tester.com (target ≥ 9/10)
- [x] Add a short SPF/DKIM/DMARC section to `RUNBOOK.md` (currently only in `brief.txt`)
- **Verification**: mail-tester score recorded; docs updated.

#### P0-2 · Resend webhook secret missing
- [ ] Set `RESEND_WEBHOOK_SECRET` in `.env` (config reads it at `config.py:46`)
- [x] Add `RESEND_WEBHOOK_SECRET` to `.env.example` (currently absent; webhook
      fails closed with 401 without it — `webhook_service.py:46-48`)
- [ ] Add a `POST /webhooks/email/resend` test that exercises a live-signed webhook
- **Verification**: `test_webhook_service.py` passes; manual webhook test delivers.

#### P0-3 · Raw consent token persisted in plaintext
- [x] Stop storing the full signed token in `consents.magic_token`
      (schema `0001_baseline.py:164`; set in `consent_service.py:200`)
- [x] Keep only `signed_token_hash` (SHA-256, `crypto.py:112-114`); migrate legacy
      rows (re-dispatch or accept-and-expire them)
- [x] Update read paths: portal routes `main.py:2137-2234`, `consent_service.py`
      legacy plain-UUID fallback at `:73-84`
- **Note**: `crypto.py:6-7` already claims "raw token never stored" — the claim
  and the schema must be reconciled.
- **Verification**: new dispatch writes no raw token; old DB migrates cleanly;
  `test_crypto.py`, `test_consent_gate.py`, e2e consent workflow all pass.
- **Note**: `magic_token` is now always written as `NULL`; new `v1.` tokens verify
  by HMAC + `signed_token_hash` equality. Pre-M3 plain-UUID rows still validate
  via the stored `magic_token` until they expire (the column remains for compat).
  e2e specs mint fresh portal links via the `remind` endpoint
  (`frontend/e2e/helpers.ts` `fetchConsentToken`) since the tracker list can no
  longer expose `magic_token`.

#### P0-4 · PII stored in plaintext outside `students`
- [x] Encrypt at rest: `consents.recipient_email`, `email_events.recipient_email`,
      `demo_requests` (`full_name`, `work_email`, `organisation`), and redact
      PII inside `audit_log.payload_json` / `consent_events.metadata_json`
      (currently plaintext per live-DB inspection)
- [x] Add a migration (pattern: AES-GCM via `crypto.py:79-101`, prefix `gcm1:`)
- [x] Decrypt at read points (`consent_service.py`, `main.py` consent/demo reads,
      `database.py` list/export queries)
- **Verification**: new + existing columns encrypted in live DB; tracker,
  portal, demo admin, and CSV export still show decrypted values; `test_crypto.py`
  and `test_consent_tracker.py` pass.
- **Note**: migration `0004_pii_encryption.py` encrypts existing rows in place
  (idempotent — skips already-`gcm1:` blobs) and redacts audit/consent-event JSON;
  equality joins/search (delivery status, email search) run through deterministic
  `recipient_email_hash` / `work_email_hash` columns so plaintext is never needed
  for SQL. Reads transparently decrypt `gcm1:` blobs and pass legacy plaintext
  through unchanged. New `test_pii_at_rest.py` (10 tests) covers ciphertext at
  rest, hash joins, and legacy read compat.

#### P0-5 · Legal review outstanding
- [ ] Privacy policy, Terms, DPA reviewed by counsel (pages exist:
      `marketing/app/privacy/page.tsx`, `terms/page.tsx`, `dpa/page.tsx`,
      `public/dpa-template.pdf`)
- [ ] FERPA/COPPA compliance check formalized (currently marketing copy only)
- **Verification**: reviewer sign-off noted in this file.

---

### P1 — High

#### P1-1 · Email queue / async sending
- [ ] Replace synchronous inline `send_html_email` (`email_sender.py:106-139`)
      with an outbox table + worker (in-process asyncio loop is the existing
      pattern at `main.py:303-316`; no Celery/Redis)
- [ ] Keep `email_events` correlation (`esp_message_id`)
- **Verification**: bulk dispatch of 1000 consents returns fast; queue drains;
      `test_email_sender.py` + `test_load_roster.py` pass.

#### P1-2 · Security header gaps (HSTS, nginx, marketing)
- [x] Add `Strict-Transport-Security` to backend middleware (`main.py:165-208`)
- [x] Add security headers to `frontend/nginx.conf` (currently none; SPA served
      outside backend CSP) and marketing `next.config.js` `headers()`
- [x] Extend `test_security_headers.py` to cover HSTS + nginx/next configs
- **Verification**: curl shows HSTS on backend and SPA responses; tests pass.
- **Note**: marketing CSP branches on `NODE_ENV` — dev allows `'unsafe-eval'`
  (webpack hydration needs it) and same-origin websockets; production allows the
  reCAPTCHA script (`https://www.google.com`, `https://www.gstatic.com`).

#### P1-3 · CSRF defense
- [x] Add Origin/`Sec-Fetch-Site` check middleware for state-changing requests
      (bearer tokens + CORS allowlist exist but no explicit CSRF defense)
- **Verification**: cross-site state-change POST is rejected; new unit test.
- **Note**: `_origin_matches_host` also honours `X-Forwarded-Host` so requests
  proxied by Next.js `rewrites` (marketing → backend) still pass the same-origin
  check; the marketing origin (`:3000`) is in the e2e `CORS_ORIGINS`.

#### P1-4 · Demo request assignment UI
- [x] Expose `assigned_to` in `frontend/src/components/admin/DemoRequestsPanel.tsx`
      (API + type already exist: `src/api/admin.ts:71`, `src/types/index.ts:268`)
- **Verification**: assign from dropdown; persists via `PATCH /api/v1/admin/demo-requests/{id}`.

#### P1-5 · Client-side consent gating
- [x] In `StudentManagementPage.tsx` (note at `:115`, button at `:106-112`),
      fetch consent status and disable "Run Rolling Risk Analysis" when no
      active consent (server already 403s via `consent_gate.py`)
- [x] Added `consent_status` (`consent_status_for_ui`) to `GET /api/counsellor/students/{id}`;
      gated button + amber notice in `RiskAnalysisPanel`
- **Verification**: UI disables without a valid consent; e2e still passes;
      `test_student_detail_reports_missing_consent_for_ui_gating` added.

#### P1-6 · Per-institution reminder days ignored
- [x] `process_consent_reminders` (`consent_service.py:692-717`) reads only global
      `CONSENT_REMINDER_DAYS` (`:699`); make it honor
      `institutions.consent_reminder_days` (default `[3,7]`)
- **Verification**: `test_consent_gate.py` covers both global and per-institution.

---

### P2 — Medium

#### P2-1 · Database/Redis decision
- [ ] Decide SQLite vs PostgreSQL for production (currently SQLite-only;
      checklist called for Railway Postgres + Redis)
- [ ] If Postgres: add `DATABASE_URL` handling in `config.py`/`database.py` +
      `psycopg` dep; if staying on SQLite, document the decision in RUNBOOK
- [ ] If Redis: use for rate-limit store (currently in-memory `main.py:332-356`)
      and email queue
- **Verification**: decision recorded; live deploy uses the chosen store.

#### P2-2 · Error monitoring (Sentry)
- [ ] Add `sentry-sdk` to backend (`backend/requirements.txt`) + init in
      `main.py`; `@sentry/*` to `frontend` and `marketing`
- [ ] Add `SENTRY_DSN` to `.env.example` and docs
- **Verification**: test error appears in Sentry; config documented.

#### P2-3 · Analytics (Plausible/PostHog)
- [ ] Add script to `marketing/app/layout.tsx` (currently zero analytics)
- [ ] Add `NEXT_PUBLIC_*` analytics config to `marketing/.env.example`
- **Verification**: pageview appears in dashboard.

#### P2-4 · Uptime monitoring
- [ ] Set up Better Uptime/UptimeRobot on `/api/health` (`main.py:319-321`),
      `/api/v1/healthz` (`:324-329`), frontend `/health`, marketing /
- [ ] Document alert routing in RUNBOOK
- **Verification**: probe active + alert fires on outage.

#### P2-5 · Scheduled backups
- [ ] Wire `backend/scripts/backup_db.py` to a schedule (cron or `railway cron`);
      S3 offload if `BACKUP_S3_BUCKET` set
- [ ] Tick the unchecked RUNBOOK go-live item (`RUNBOOK.md:326`)
- **Verification**: snapshot produced on schedule; restore test passes.

#### P2-6 · Runbook gaps (rollback, ENCRYPTION_KEY rotation)
- [ ] Add deployment rollback/release-backout procedure (currently missing)
- [ ] Add `ENCRYPTION_KEY` rotation procedure (only JWT rotation covered,
      `RUNBOOK.md:243`)
- **Verification**: procedures documented with commands.

#### P2-7 · Email rendering + screenshots
- [ ] Email render testing (Litmus/Email on Acid) for all templates in
      `email_templates.py` (Gmail, Outlook, iOS Mail)
- [ ] Add product screenshots/images to `marketing/app/product/page.tsx`
      (currently text cards only)
- **Verification**: render report saved; screenshots present.

#### P2-8 · `.env.example` completeness
- [ ] Add missing documented keys: `RESEND_WEBHOOK_SECRET`, `RECAPTCHA_SECRET`,
      `MINDGUARD_DB_DIR`, `MINDGUARD_CSP`, `WEBHOOK_TOLERANCE_SECONDS`,
      `SECRETS_FILE_DIR` (all read in `config.py`, several absent from template)
- **Verification**: every `os.getenv` key in `config.py` is in `.env.example` or RUNBOOK.

---

### P3 — Ops / polish

- [ ] **P3-1 Stale README**: rewrite `README.md` for the FastAPI/React stack
      (currently documents legacy Streamlit; env table is legacy; references
      missing files `CLAUDE.md`/`MINDGUARD_DEV_GUIDE.md` at `README.md:271-272`)
- [ ] **P3-2 Operator contacts**: document registrar/ESP/Railway/Vercel contacts
      (currently only a requirement in `brief.txt`)
- [ ] **P3-3 Decisions**: finalize domain (marketing assumes `mindguard.ai`),
      final pricing numbers (marketing says "Contact us"), confirm Kenya=18
      jurisdiction, data residency
- [ ] **P3-4 Load test 50 demo/min**: add a stress test for `POST /api/v1/demo-requests`
      (only 5/hr/IP rate limit exists, `main.py:2605`)
- [ ] **P3-5 Screen-reader testing**: manual NVDA/VoiceOver pass over tracker,
      portal, demo form (axe-core already in e2e)
- [ ] **P3-6 Demo pipeline owner**: confirm the person/alias behind
      `DEMO_NOTIFY_EMAIL` responds; document SLA

---

## 4. Gotchas & pitfalls (from audit)

- **Do not look for route modules** in `backend/routes/` — it's empty; everything
  is in `backend/main.py`.
- **`backend/mindguard.db` and root `mindguard.db` are two separate SQLite files.**
  The root one is live (has WAL). Use `MINDGUARD_DB_DIR` to point at the right DB.
- **Do not store new secrets in `.env` without adding them to `.env.example`.**
  `RESEND_WEBHOOK_SECRET` was missed this way and webhooks silently 401.
- **The token contract**: never persist the raw signed token. If you touch the
  portal flow, keep the `signed_token_hash`-only invariant (see P0-3).
- **Migration style**: no autogenerate (`alembic/env.py` has `target_metadata=None`),
  raw SQL DDL + `render_as_batch=True`. Follow `0001_baseline.py` conventions.
- **Encryption**: use `crypto.py` helpers (`encrypt_pii`/`decrypt_pii`); never
  roll your own; keep the `gcm1:` prefix format.
- **Consent gate is authoritative**: frontend must not bypass the server 403.
- **Test before/after**: `pytest -q` (backend) and `npm run test:e2e` (frontend).
  CI runs both; a PR that breaks them will fail the pipeline.
- **Never print/commit real secret values** in tests, this file, or code.

---

## 5. How to pick this up

1. Read `AGENTS.md` (setup), `RUNBOOK.md` (ops/deploy), and this file.
2. Start with P0 items — they block launch.
3. For each item: run its listed verification before and after your change.
4. Tick `[ ]` → `[x]`, add a `> DONE:` line, update the date below.
5. If you find a new gap, add it with the next free ID.

---

_Last updated: 2026-08-12_
