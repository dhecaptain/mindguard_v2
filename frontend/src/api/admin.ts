import api from './client'
import type { Institution, RosterStudent, RosterUploadSummary } from '../types'

// ─── Roster & School Admin (Delivery Brief §5) ────────────────────────────────

export async function getInstitutions(): Promise<Institution[]> {
  const { data } = await api.get('/v1/admin/institutions')
  return data.institutions ?? data
}

export async function getRosterStudents(
  institutionId?: string,
  limit = 500,
): Promise<RosterStudent[]> {
  const { data } = await api.get('/v1/admin/students', {
    params: institutionId ? { institution_id: institutionId, limit } : { limit },
  })
  return data.students ?? data
}

export async function uploadRoster(
  file: File,
  institutionId: string,
): Promise<RosterUploadSummary> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/v1/admin/roster/upload?institution_id=${institutionId}`, form)
  return data
}

export async function runConsentMaintenance(): Promise<{
  expired: number
  reminders: { sent: number; failed: number }
}> {
  const { data } = await api.post('/v1/admin/consents/run-maintenance')
  return data
}
