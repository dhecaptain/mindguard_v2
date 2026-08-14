# MindGuard Go-Live Checklist (deferred items)

Everything that needs *code* is done (commit `c349a3c`, tests green, e2e 4/4).
The items below are the ones that need **you** — accounts, decisions, or
hands-on verification. Do them top-to-bottom; each ends with a verification
step (tick when true). When an item needs me to check something afterwards,
it's marked **→ tell me**.

---

## 1. DNS + domains (P0-1, P3-3a)

**Goal**: consent/demo emails reach inboxes; the site is reachable at your
real domain.

- [ ] Buy/confirm your domain (assumed `mindguard.ai` in marketing copy). If you
  pick a different one, tell me so I can update `EMAIL_FROM` defaults and copy.
- [ ] **Resend sender domain** — in the Resend dashboard, *Domains → Add
  Domain* for your sending domain (e.g. `mindguard.ai`).
- [ ] **SPF**: add the TXT record Resend shows under that domain. Resend uses
  SES, typically `v=spf1 include:amazonses.com ~all` — copy the exact value
  Resend displays.
- [ ] **DKIM**: add the TXT record(s) Resend generates for `_domainkey`.
- [ ] Wait a few minutes, then in Resend confirm SPF + DKIM both show
  **Verified** (green).
- [ ] **DMARC**: add `_dmarc.mindguard.ai` TXT:
  `v=DMARC1; p=none; rua=mailto:dmarc@mindguard.ai; pct=100`.
- [ ] Set `EMAIL_FROM=MindGuard <noreply@mindguard.ai>` in Railway variables
  (must match the authenticated domain).
- [ ] **App domain**: Railway → service → Settings → Custom Domain → add
  `app.mindguard.ai` + TLS. Then set `APP_BASE_URL=https://app.mindguard.ai`.
- [ ] **Marketing domain**: Vercel project → add your root domain + `www`,
  attach TLS.
- **Verification**:
  - [ ] `scripts/test_email.py you@example.com` (see §2) — delivered to inbox, not spam.
  - [ ] Mail-tester.com score **≥ 9/10** (send a consent request to a throwaway address).
  - [ ] `curl https://app.mindguard.ai/api/v1/healthz` returns `{"status":"ok",...}`.
  - [ ] `curl https://mindguard.ai` returns the marketing homepage.
  - [ ] **→ tell me** when domains are live so I can add the real origins to `CORS_ORIGINS`
    and Supabase redirect URLs.

---

## 2. Live email + webhook (P0-2)

**Goal**: transactional email actually flows and bounce/delivery events land
in the audit trail.

- [ ] Set `RESEND_API_KEY` in Railway variables (generate an API key in Resend).
- [ ] Run the smoke test from the repo root:
  ```bash
  source .venv/bin/activate
  cd backend && PYTHONPATH=..:. python3 scripts/test_email.py you@example.com
  ```
- [ ] In Resend: *Webhooks → Add Webhook* → URL `https://app.mindguard.ai/webhooks/email/resend`
  → sign the secret Resend gives you.
- [ ] Set `RESEND_WEBHOOK_SECRET=<that secret>` in Railway variables (the app
  rejects unsigned webhooks with 401 without it — `webhook_service.py`).
- [ ] In Resend, send a test bounce (Webhooks → *Test event*) or send an email
  to a hard-bounce address and confirm the webhook fires.
- **Verification**:
  - [ ] Backend log shows the `POST /webhooks/email/resend` request arriving (200).
  - [ ] A bounced consent shows status `INVALID` in the tracker (bounce pipeline).
  - [ ] **→ tell me** when a real webhook has been received so I can run a
    live-signature test against the deployed endpoint.

---

## 3. Database decision (P2-1)

**Goal**: decide production data store so data survives and scales.

- [ ] Decide **SQLite on Railway volume** (current code, zero migration work,
  fine for a few thousand students) **vs Postgres** (needed only if you expect
  heavy concurrent writes / horizontal scaling).
- [ ] If **SQLite**: just confirm the volume is attached (RUNBOOK §6) — no code
  changes needed. Note: volume data is deleted **30 days after a free-trial
  expires**; Hobby plan keeps it.
- [ ] If **Postgres**: tell me. I'll add `DATABASE_URL` handling in
  `config.py`/`database.py` (+ `psycopg`), a Postgres-flavored Alembic path,
  and point `MINDGUARD_DB_DIR` logic at it.
- **Verification**:
  - [ ] A recorded decision (add one line to `RUNBOOK.md` "Database" section, or
    tell me and I'll write it).
  - [ ] **→ tell me** your choice; if Postgres, share the connection string
    (I'll never commit it).

---

## 4. Sentry (P2-2 live)

**Goal**: errors actually get reported. The code is wired on all three apps —
only the DSNs are missing.

- [ ] Create a free Sentry account → create **one org** (e.g. `mindguard`).
- [ ] Create project **`mindguard-backend`** → copy DSN.
  - [ ] Set in Railway: `SENTRY_DSN=<dsn>`, `SENTRY_ENVIRONMENT=production`,
    `SENTRY_TRACES_SAMPLE_RATE=0.1`.
- [ ] Create project **`mindguard-web`** → copy DSN.
  - [ ] Set `VITE_SENTRY_DSN=<dsn>`, `VITE_SENTRY_ENVIRONMENT=production`,
    `VITE_SENTRY_TRACES_SAMPLE_RATE=0.1` as **build-time** variables (frontend
    builds on Railway from the Dockerfile — set them as Railway variables so the
    build inlines them).
- [ ] Create project **`mindguard-marketing`** → copy DSN.
  - [ ] Set in marketing (Vercel): `SENTRY_DSN=<dsn>`,
    `NEXT_PUBLIC_SENTRY_DSN=<same-dsn>`, `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`.
  - [ ] Optional source-map uploads: `SENTRY_ORG`, `SENTRY_PROJECT`,
    `SENTRY_AUTH_TOKEN` (create an org auth token in Sentry → Settings → Auth
    Tokens, scope `project:releases`).
- **Verification**:
  - [ ] Redeploy backend, then trigger a test error and confirm it appears in
    the Sentry project (RUNBOOK "Monitoring").
  - [ ] Confirm the event has **no request body / email fields** (PII strip works).
  - [ ] **→ tell me** when a test event lands; I'll sanity-check the payload shape.

---

## 5. Plausible analytics (P2-3 live)

**Goal**: privacy-first traffic stats for the marketing site. Code is wired
(gated by env); only the site domain is missing.

- [ ] Create a Plausible account (or self-host) → *Add Website* for your
  marketing domain (e.g. `mindguard.ai`).
- [ ] Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=mindguard.ai` in marketing (Vercel) env.
- **Verification**:
  - [ ] Load the homepage → Plausible dashboard shows the pageview within a
    minute (no cookie banner appears — it's cookieless).
  - [ ] **→ tell me** when verified.

---

## 6. Uptime monitoring (P2-4)

**Goal**: get alerted if any of the four surfaces goes down.

- [ ] Sign up for **UptimeRobot** (free, 50 monitors) or **Better Uptime**.
- [ ] Create monitors (HTTP(S), expect `200`):
  - Backend API: `https://app.mindguard.ai/api/v1/healthz`
  - Web app: `https://app.mindguard.ai/`
  - Marketing: `https://mindguard.ai/`
  - Healthz (2nd, keyword-checked for `"status":"ok"`): same as first if you want.
- [ ] Set a 1-minute interval and an email/SMS alert contact.
- **Verification**:
  - [ ] All monitors show **Up**.
  - [ ] Kill the backend once (optional) and confirm an alert fires.
  - [ ] **→ tell me** the monitor URLs and I'll add an "Uptime monitoring" note to RUNBOOK.

---

## 7. Email rendering (P2-7)

**Goal**: consent/reminder/demo emails look right in Gmail, Outlook, iOS Mail.

- [ ] Sign up for **Litmus** (or **Email on Acid**) trial.
- [ ] Send the four templates to the render-test inbox from a staging deploy:
  - Parent consent request, student consent request, courtesy copy,
    consent confirmation + admin notification, and reminder (all in
    `backend/services/email_templates.py`; dispatch via the tracker UI).
- [ ] Review each screenshot; fix layout issues (report them to me or send me
  the screenshots).
- **Verification**:
  - [ ] Every template passes Gmail, Outlook, iOS Mail with no clipped/wrapped
    CTAs.
  - [ ] **→ tell me** if any template needs CSS fixes.

---

## 8. Legal (P0-5) + product decisions (P3-3)

**Goal**: pages we ship are defensible; numbers and jurisdiction are real.

- [ ] Have counsel (or a template service like Termageddon/One Page) review:
  - [ ] `marketing/app/privacy/page.tsx`
  - [ ] `marketing/app/terms/page.tsx`
  - [ ] `marketing/app/dpa/page.tsx` + `marketing/public/dpa-template.pdf`
  - [ ] Update the pages with the review outcome + your company's legal name/address.
- [ ] **FERPA/COPPA** — confirm the compliance claims in the marketing copy with
  counsel; adjust copy if needed.
- [ ] Confirm **jurisdiction**: the code assumes Kenya (data subject = 18+ for
  adult students; `brief.txt`). Tell me if that's wrong and I'll change the
  adult-age constant and copy.
- [ ] Decide **data residency** (where PII is stored — Railway region).
- [ ] Final **pricing** numbers for `marketing/app/pricing/page.tsx` (currently
  "Contact us"). Tell me the plan and I'll write the page.
- **Verification**:
  - [ ] Privacy/Terms/DPA pages carry your real legal entity + review date.
  - [ ] Pricing page shows real numbers (or an explicit "early access" note).
  - [ ] **→ tell me** your decisions on jurisdiction + pricing + residency.

---

## 9. Ops contacts (P3-2)

**Goal**: someone can act fast if a service breaks.

- [ ] Fill in and keep in a private doc (NOT in git):
  - Registrar / DNS provider (login + 2FA recovery)
  - Resend account owner + API-key holder
  - Railway + Vercel project owners
  - Sentry + UptimeRobot admins
  - Supabase project owner
- **Verification**:
  - [ ] Two people (or owner + backup) can log into every service above.
  - [ ] **→ tell me** if you want a `RUNBOOK.md` "Contacts" section template
    (names only, no secrets) added.

---

## 10. Demo pipeline owner (P3-6)

**Goal**: demo requests don't rot.

- [ ] Confirm the real inbox behind `DEMO_NOTIFY_EMAIL` (set in Railway) is
  monitored by a named owner.
- [ ] Agree an SLA: reply to demo requests within e.g. **2 business days**.
- **Verification**:
  - [ ] Submit a demo via the marketing site → confirmation email arrives →
    `DEMO_NOTIFY_EMAIL` receives the admin notification.
  - [ ] **→ tell me** the SLA; I'll add one line to RUNBOOK.

---

## 11. Screen-reader pass (P3-5)

**Goal**: keyboard/screen-reader users can complete the consent flow. Not
automatable — needs a human with NVDA (Windows) or VoiceOver (macOS).

- [ ] Install NVDA (free) or use VoiceOver.
- [ ] Walk through, in order:
  - [ ] Login → consent tracker → roster upload (Roster panel)
  - [ ] Consent portal accept/decline flow (`/consent/...` link)
  - [ ] Marketing demo request form
- [ ] For each screen: tab order sensible, buttons/links have spoken labels,
  focus is visible, no traps.
- **Verification**:
  - [ ] All three flows complete with the screen reader alone (no mouse).
  - [ ] **→ tell me** any failures; I'll fix them in code.

---

## Wrap-up

When every box above is ticked, **→ tell me** and I'll:
1. Update `REMEDIATION_PLAN.md` to mark the deferred items done.
2. Add the final `RUNBOOK.md` notes (uptime monitors, contacts template, DB
   decision, demo SLA).
3. Update `CORS_ORIGINS`/Supabase redirects for the live domains.
4. Run the full backend suite + e2e once more against the live-like config.
