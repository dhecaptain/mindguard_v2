# Frontend Rules — mindguard_v2/frontend

- Never use `any` in TypeScript. Use `unknown` + narrowing or explicit interfaces in `src/types/index.ts`.
- Use Tailwind `emerald-500` for primary actions; never inline hex. Glass surfaces must have `backdrop-blur` + `bg-white/10`.
- Zustand stores: one file per domain (`authStore`, `counsellorStore`, `analysisStore`). No cross-store direct imports — use `api/*`.
- API calls via `src/api/client.ts` only — includes JWT, CSRF, retry. Never raw `fetch`.
- Risk display: `RiskBadge` + `OverallBanner` use `getRiskLabel()` from `src/lib/`. Never duplicate risk thresholds.
- `pnpm dlx` not `npx` for shadcn: `pnpm dlx shadcn@latest add <component>`
- Before commit: `npx tsc --noEmit --project tsconfig.app.json` must pass. Agent must run `scripts/agent-eyes.mjs` after UI changes.
- Cohesion 0.04 warning: `Frontend State & API` community is too large — split new features into `src/components/<domain>/`.
