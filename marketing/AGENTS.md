# Marketing Rules — mindguard_v2/marketing

- Next.js 14 App Router only. No `pages/` directory. Components in `components/` use `framer-motion` + Tailwind.
- Pricing: `PricingCalculator` uses `marketing/app/pricing` token scale. Never hardcode currency values.
- Demo form: `DemoForm` must include `recaptcha.ts` verify + `composio_fastlane.mjs` dispatch. Validate against `brief.txt` consent lifecycle.
- Docs: `app/docs/*` must reference `Consent Lifecycle: pending→accepted→declined→expired→revoked→invalid`. Surprising connection `FAQ Docs → Consent Lifecycle` is intentional.
- Build check: `npx tsc --noEmit` passes. Use `next lint` before commit.
