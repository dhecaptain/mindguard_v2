import api from './client'

// ─── Demo request pipeline — public submission (Delivery Brief §6) ───────────

export interface DemoSubmission {
  full_name: string
  work_email: string
  organisation: string
  organisation_type: string
  role_title?: string
  country?: string
  student_count_range?: string
  message?: string
  heard_about_us?: string
  consent_to_contact: boolean
}

export async function submitDemoRequest(payload: DemoSubmission): Promise<{
  id: string
  status: string
  warning?: string | null
}> {
  const { data } = await api.post('/v1/demo-requests', payload)
  return data
}
