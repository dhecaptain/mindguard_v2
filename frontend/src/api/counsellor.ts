import api from './client'
import type {
  Consent, LinkedAccount, Alert, AlertDisposition,
  AuditEvent, Note, TimelineEntry,
} from '../types'

export interface StudentDTO {
  id: string
  name: string
  email: string
  role_type: string
  status: string
  created_at: string
}

export interface StudentDetail {
  id: string
  email: string
  name: string
  status: string
  created_at: string
  risk_summary: {
    latest_prob: number
    latest_label: string
    latest_color: string
    total_analyses: number
    high_risk_count: number
  }
  analyses: Array<{
    id: string
    platform: string
    text: string | null
    prob: number
    label: string
    created_at: string
  }>
}

export interface Referral {
  id: string
  counsellor_id: string
  student_id: string
  urgency: string
  status: string
  notes: string
  created_at: string
  updated_at: string
  student_name?: string
  student_email?: string
}

export interface Conversation {
  other_id: string
  other_name: string
  other_email: string
  last_message: string
  last_time: string
  unread: number
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  read: number
  created_at: string
}

export interface DashboardData {
  total_students: number
  pending_approvals: number
  open_referrals: number
  crisis_flags_7d: number
  recent_referrals: Referral[]
}

export async function getStudents(): Promise<StudentDTO[]> {
  const { data } = await api.get('/counsellor/students')
  return data
}

export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const { data } = await api.get(`/counsellor/students/${id}`)
  return data
}

export async function approveStudent(id: string): Promise<void> {
  await api.post('/counsellor/students/approve', { id })
}

export async function revokeStudent(id: string): Promise<void> {
  await api.post('/counsellor/students/revoke', { id })
}

export async function getReferrals(): Promise<Referral[]> {
  const { data } = await api.get('/counsellor/referrals')
  return data
}

export async function createReferral(student_id: string, urgency: string, notes: string): Promise<Referral> {
  const { data } = await api.post('/counsellor/referrals', { student_id, urgency, notes })
  return data
}

export async function updateReferral(id: string, updates: { status?: string; notes?: string }): Promise<Referral> {
  const { data } = await api.patch(`/counsellor/referrals/${id}`, updates)
  return data
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/counsellor/conversations')
  return data
}

export async function getConversation(otherId: string): Promise<Message[]> {
  const { data } = await api.get(`/counsellor/conversations/${otherId}`)
  return data
}

export async function sendMessage(receiver_id: string, message: string): Promise<Message> {
  const { data } = await api.post('/counsellor/messages', { receiver_id, message })
  return data
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get('/counsellor/dashboard')
  return data
}

// ─── Consents ─────────────────────────────────────────────────────────────────

export async function getConsents(status?: string): Promise<Consent[]> {
  const { data } = await api.get('/v1/consents', { params: status ? { status } : undefined })
  return data.consents ?? data
}

export async function getConsent(id: string): Promise<Consent> {
  const { data } = await api.get(`/v1/consents/${id}`)
  return data
}

export async function createConsent(
  studentId: string,
  payload: {
    recipient_email: string
    recipient_role: 'student' | 'parent'
    platforms: string[]
    mode: 'ON_DEMAND' | 'CONTINUOUS'
  }
): Promise<Consent> {
  const { data } = await api.post(`/v1/students/${studentId}/consent`, payload)
  return data
}

export async function dispatchConsent(consentId: string): Promise<Consent> {
  const { data } = await api.post(`/v1/consents/${consentId}/dispatch`)
  return data
}

export async function cancelConsent(consentId: string): Promise<void> {
  await api.post(`/v1/consents/${consentId}/cancel`)
}

export async function remindConsent(consentId: string): Promise<void> {
  await api.post(`/v1/consents/${consentId}/remind`)
}

// ─── Account Linking ──────────────────────────────────────────────────────────

export async function getLinkedAccounts(studentId: string): Promise<LinkedAccount[]> {
  const { data } = await api.get(`/v1/students/${studentId}/accounts`)
  return data
}

export async function linkAccount(
  studentId: string,
  payload: { platform: string; mode: 'handle'; handle: string }
): Promise<LinkedAccount> {
  const { data } = await api.post(`/v1/students/${studentId}/accounts`, payload)
  return data
}

export async function unlinkAccount(studentId: string, accountId: string): Promise<void> {
  await api.delete(`/v1/students/${studentId}/accounts/${accountId}`)
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(status?: 'OPEN' | 'CLOSED'): Promise<Alert[]> {
  const { data } = await api.get('/v1/alerts', { params: status ? { status } : undefined })
  return data.alerts ?? data
}

export async function disposeAlert(
  alertId: string,
  payload: { action: AlertDisposition; reason_code: string; reason_note?: string }
): Promise<Alert> {
  const { data } = await api.post(`/v1/alerts/${alertId}/disposition`, payload)
  return data
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export async function getStudentTimeline(studentId: string): Promise<TimelineEntry[]> {
  const { data } = await api.get(`/v1/students/${studentId}/timeline`)
  return data
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNotes(studentId: string): Promise<Note[]> {
  const { data } = await api.get(`/v1/students/${studentId}/notes`)
  return data
}

export async function createNote(studentId: string, body: string): Promise<Note> {
  const { data } = await api.post(`/v1/students/${studentId}/notes`, { body })
  return data
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function getAuditLog(): Promise<AuditEvent[]> {
  const { data } = await api.get('/v1/audit')
  return data.entries ?? data
}
