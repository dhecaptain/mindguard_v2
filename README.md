# MindGuard

> Consent-first, human-in-the-loop decision support for student wellbeing. MindGuard helps school and university counselling teams identify early signs of distress in consented digital content, powered by Mental-RoBERTa and reviewed by trained staff before any action.

MindGuard is **not** a diagnostic tool, does not automate decisions, and every risk output requires a qualified human reviewer.

## Repo layout

- **`backend/`** — FastAPI service (consent workflow, roster upload, RBAC, email outbox, ESP webhooks, risk inference)
- **`frontend/`** — counsellor product UI (React + Vite SPA)
- **`marketing/`** — public marketing site + demo request form (Next.js 14 + Tailwind)
- **`RUNBOOK.md`** — environment variables, verification, deploy, backup, rollback and go-live steps
- **`AGENTS.md`** — setup guide (backend `.env`, Google OAuth via Supabase, test commands)
- **`REMEDIATION_PLAN.md`** — security/reliability backlog tracker

## Key properties

- **Consent-first by construction** — analysis of any subject is gated behind an accepted, non-expired, non-revoked consent (server-enforced 403 + client-side gating).
- **Durable email outbox** — every outgoing message is persisted (write-ahead) and drained by a background worker with retry/backoff, so bulk roster dispatch never blocks on the ESP.
- **PII encrypted at rest** — recipient emails, names, DOB and demo-request fields use AES-256-GCM; only key-independent hashes are stored for joins.
- **Append-only audit trail** — admin actions, consent transitions and delivery events are logged to `audit_log` / `consent_events` / `email_events`.

## Quickstart

Backend (run from the repo root so the root `.env` is picked up):

```bash
cp .env.example .env          # fill in JWT_SECRET (required) and ENCRYPTION_KEY
python3 -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Frontend and marketing:

```bash
cd frontend && npm install && npm run dev        # http://localhost:5173
cd marketing && npm install && npm run dev       # http://localhost:3000
```

## Testing

```bash
# Backend unit tests (~197) — from the repo root
source .venv/bin/activate && cd backend
PYTHONPATH=..:. python3 -m pytest -q

# End-to-end (Playwright) — starts its own servers + throwaway DB, fully offline
cd frontend && npm run test:e2e

# Frontend type-check
cd frontend && npm run build
```

CI (`.github/workflows/ci.yml`) runs both suites on every push/PR.

## Configuration

Copy `.env.example` → `.env` and fill in the values. `JWT_SECRET` is required at
startup; `ENCRYPTION_KEY` is required in production (a dev-only key is
auto-generated otherwise). Full variable reference, Railway deploy table, backup
scheduling, rollback and secret-rotation procedures live in
[`RUNBOOK.md`](./RUNBOOK.md).

## Contributing

- Branch naming: `feature/<description>`, `fix/<description>`, `chore/<description>`.
- Before opening a PR: backend `pytest` green, frontend type-check/build green,
  Playwright e2e green, `ruff check` clean (see CI).
- PRs need at least one reviewer.

## License & safety

© 2026 MindGuard. All rights reserved.

MindGuard is a research prototype. It is not a certified medical device and must
not be used as the sole basis for any clinical decision, diagnosis, or treatment.
If someone is in immediate danger, call emergency services.
