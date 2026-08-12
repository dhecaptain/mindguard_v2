import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { API_BASE, adminAuth, blockExternalRequests, expectNoAxeViolations, fetchConsentToken, fetchConsents, loginAsAdmin } from './helpers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.resolve(__dirname, 'fixtures', 'roster-3minors-3adults.csv')

const PARENT_EMAILS = [
  'parent1@e2e.parents.org',
  'parent2@e2e.parents.org',
  'parent3@e2e.parents.org',
]
const ADULT_STUDENTS = [
  'adult1@e2e.students.org',
  'adult2@e2e.students.org',
  'adult3@e2e.students.org',
]

const portalUrl = (token: string) =>
  `http://127.0.0.1:5188/consent/${encodeURIComponent(token)}`

test.beforeEach(async ({ page }) => {
  await blockExternalRequests(page)
})

test.describe('Consent workflow (Delivery Brief §9.3)', () => {
  test('roster upload dispatches parent, courtesy and adult consent requests', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page)
    await page.getByText('Consent Tracker').click()
    await page.getByRole('button', { name: 'Roster' }).click()

    await page.getByLabel('Send consent requests immediately').check()
    await page.locator('input[type="file"]').setInputFiles(FIXTURE)
    await page.getByRole('button', { name: 'Upload & send consents' }).click()

    await expect(page.getByText('6 request(s) dispatched')).toBeVisible()
    await expect(page.getByText(/6 email\(s\) failed/)).toBeVisible()

    const { token } = await adminAuth(request)
    const rows = await fetchConsents(request, token)
    expect(rows).toHaveLength(6)

    const parentRows = rows.filter((r) => r.recipient_role === 'parent')
    const adultRows = rows.filter(
      (r) => r.recipient_role === 'student' && ADULT_STUDENTS.includes(r.recipient_email),
    )

    expect(parentRows.map((r) => r.recipient_email).sort()).toEqual(
      [...PARENT_EMAILS].sort(),
    )
    expect(adultRows.map((r) => r.recipient_email).sort()).toEqual(
      [...ADULT_STUDENTS].sort(),
    )
    expect(new Set(rows.map((r) => r.student_id)).size).toBe(6)
    // Raw tokens are never persisted (P0-3): every parent must still have a
    // live link mintable by an authorised user.
    for (const row of parentRows) {
      expect(await fetchConsentToken(request, token, row.id)).toBeTruthy()
    }
    expect(rows.every((r) => ['PENDING', 'SENT', 'VIEWED'].includes(r.status))).toBeTruthy()
  })

  test('parent accepts a minor consent link and the status flips to ACCEPTED', async ({
    page,
    request,
  }) => {
    const { token } = await adminAuth(request)
    const rows = await fetchConsents(request, token)
    const parentRow = rows.find((r) => r.recipient_email === PARENT_EMAILS[0])
    const parentToken = await fetchConsentToken(request, token, parentRow!.id)

    await page.goto(portalUrl(parentToken))
    await expectNoAxeViolations(page, 'consent portal (pre-action)')
    await page.getByPlaceholder('Type your full name').fill('Rebecca Haddad')
    await page.getByRole('button', { name: 'Accept consent' }).click()
    await expect(page.getByText('Consent accepted. Thank you.')).toBeVisible()
    await expectNoAxeViolations(page, 'consent portal (accepted)')

    const after = await fetchConsents(request, token)
    expect(after.find((r) => r.id === parentRow!.id)?.status).toBe('ACCEPTED')
  })

  test('adult declines and analysis is blocked without active consent', async ({
    page,
    request,
  }) => {
    const { token } = await adminAuth(request)
    const rows = await fetchConsents(request, token)
    const adultRow = rows.find((r) => r.recipient_email === ADULT_STUDENTS[0])
    const adultToken = await fetchConsentToken(request, token, adultRow!.id)

    await page.goto(portalUrl(adultToken))
    await page.getByRole('button', { name: 'Decline' }).click()
    await expect(page.getByText('Consent declined.')).toBeVisible()

    const after = await fetchConsents(request, token)
    const updated = after.find((r) => r.id === adultRow!.id)
    expect(updated?.status).toBe('DECLINED')

    const analyze = await request.post(
      `${API_BASE}/api/v1/students/${adultRow!.student_id}/analyze`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          platform: 'reddit',
          posts: [{ text: 'having a hard week', risk_score: 0.3 }],
        },
      },
    )
    expect(analyze.status()).toBe(403)
  })
})
