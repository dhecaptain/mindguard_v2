import AxeBuilder from '@axe-core/playwright'
import { expect, type APIRequestContext, type Page } from '@playwright/test'

export const API_BASE = 'http://127.0.0.1:8000'

export const ADMIN = { email: 'e2e-admin@school.edu', password: 'Password123!' }
export const COUNSELLOR = { email: 'e2e-counsellor@school.edu', password: 'Password123!' }

/** Block Google Fonts so page "load" is not held hostage when offline (AGENTS.md). */
export async function blockExternalRequests(page: Page): Promise<void> {
  await page.route('**://fonts.googleapis.com/**', (r) => r.abort())
  await page.route('**://fonts.gstatic.com/**', (r) => r.abort())
}

export async function loginViaApi(
  ctx: APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const res = await ctx.post(`${API_BASE}/api/auth/login`, {
    data: { email, password },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.access_token).toBeTruthy()
  return body.access_token
}

export async function adminAuth(
  ctx: APIRequestContext,
): Promise<{ token: string; authHeaders: Record<string, string> }> {
  const token = await loginViaApi(ctx, ADMIN.email, ADMIN.password)
  return { token, authHeaders: { Authorization: `Bearer ${token}` } }
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/')
  await page.getByPlaceholder('you@example.com').fill(ADMIN.email)
  await page.getByPlaceholder('••••••••').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Sign In' }).nth(1).click()
  try {
    await page.getByRole('button', { name: 'I Consent and Continue' }).waitFor({ timeout: 8000 })
    await page.getByRole('checkbox', { name: /I have read and agree/ }).check()
    await page.getByRole('button', { name: 'I Consent and Continue' }).click()
  } catch {
    // Terms already accepted on a prior login
  }
  await expect(page.getByText('Admin Panel').first()).toBeVisible()
}

export interface ConsentRow {
  id: string
  student_id: string
  recipient_email: string
  recipient_role: string
  status: string
  sent_at: string | null
  consent_url: string | null
  student?: { name?: string }
}

export async function fetchConsents(
  ctx: APIRequestContext,
  token: string,
): Promise<ConsentRow[]> {
  const res = await ctx.get(`${API_BASE}/api/v1/consents`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  const rows: ConsentRow[] = Array.isArray(body) ? body : body?.consents ?? []
  expect(rows.length).toBeGreaterThan(0)
  return rows
}

export async function expectNoAxeViolations(page: Page, tag: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const summary = results.violations
    .map((v) => `- ${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`)
    .join('\n')
  expect(results.violations, `${tag}: axe violations\n${summary}`).toEqual([])
}
