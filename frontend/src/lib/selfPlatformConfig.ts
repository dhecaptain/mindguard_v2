import type { PlatformSpec, SelfSocialAccount } from '../types/self'

export type AccountStage =
  | 'not_connected'
  | 'connected'
  | 'verified'
  | 'analysed'
  | 'failed'
  | 'running'

export interface HandleFieldDef {
  name: 'handle'
  label: string
  format: string
  example: string
  acceptsUrl: boolean
}

export interface CredentialFieldDef {
  name: string
  label: string
  type: 'text' | 'password'
  placeholder: string
  required: boolean
  hint?: string
  steps?: string[]
  serverKey?: boolean
}

export interface StageMeta {
  label: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'running'
}

export function handleField(spec: PlatformSpec): HandleFieldDef {
  return {
    name: 'handle',
    label: spec.handle_label || 'Handle or profile URL',
    format: spec.handle_format,
    example: spec.handle_example,
    acceptsUrl: Boolean(spec.accepts_url),
  }
}

export function credentialFields(spec: PlatformSpec): CredentialFieldDef[] {
  const cred = spec.credentials || {}
  const secretFields = cred.secret_fields || []
  if (cred.type === 'server_key') {
    return [
      {
        name: '',
        label: cred.label || 'Server credentials',
        type: 'text',
        placeholder: '',
        required: false,
        serverKey: true,
        hint: cred.where,
      },
    ]
  }
  return secretFields.map((field) => ({
    name: field,
    label: cred.label || 'Credentials',
    type: field.toLowerCase().includes('password') || field === 'app_password' ? 'password' : 'text',
    placeholder: cred.hint || '',
    required: Boolean(cred.required),
    hint: cred.hint,
    steps: cred.steps,
  }))
}

export function accountStage(
  account: SelfSocialAccount | undefined,
  runningPlatforms?: ReadonlySet<string>,
): AccountStage {
  if (!account) return 'not_connected'
  if (runningPlatforms?.has(account.platform)) return 'running'
  if (account.verification_status === 'failed') return 'failed'
  if (account.analysis_status === 'error') return 'failed'
  if (account.analysis_status === 'completed') return 'analysed'
  if (account.verification_status === 'verified') return 'verified'
  return 'connected'
}

export function stageMeta(stage: AccountStage): StageMeta {
  switch (stage) {
    case 'analysed':
      return { label: 'Analysed', tone: 'success' }
    case 'verified':
      return { label: 'Connected · verified', tone: 'info' }
    case 'connected':
      return { label: 'Connected', tone: 'neutral' }
    case 'failed':
      return { label: 'Needs attention', tone: 'danger' }
    case 'running':
      return { label: 'Analysing…', tone: 'running' }
    default:
      return { label: 'Not connected', tone: 'neutral' }
  }
}

export interface AnalysisReadiness {
  ready: boolean
  reason?: string
}

export function canAnalyze(spec: PlatformSpec, account?: SelfSocialAccount): AnalysisReadiness {
  if (!spec.analyzable) return { ready: false, reason: 'No public data available on this platform' }
  if (!account) return { ready: false, reason: 'Connect this account first' }
  if (account.verification_status === 'failed') return { ready: false, reason: 'Verification failed' }
  if (account.verification_status === 'pending') return { ready: false, reason: 'Verification is pending' }
  return { ready: true }
}

export function credentialNote(spec: PlatformSpec, account?: SelfSocialAccount): string | null {
  const cred = spec.credentials || {}
  if (cred.type === 'server_key') {
    if (spec.server_config_required && !account?.has_credentials) {
      return spec.server_config_note || cred.where || null
    }
    return cred.why || null
  }
  if (cred.required && !account?.has_credentials) {
    return cred.why || `${spec.display_name} needs credentials configured before accounts can be read.`
  }
  return null
}

export function riskLevelTone(level: string | null | undefined): {
  label: string
  tone: 'success' | 'warning' | 'danger' | 'neutral' | 'critical'
} {
  switch (level) {
    case 'low':
      return { label: 'Low risk', tone: 'success' }
    case 'moderate':
      return { label: 'Moderate', tone: 'warning' }
    case 'high':
      return { label: 'High', tone: 'danger' }
    case 'critical':
      return { label: 'Critical', tone: 'critical' }
    default:
      return { label: 'Not assessed', tone: 'neutral' }
  }
}

export function platformLabelByKey(key: string, platforms: PlatformSpec[] | null): string {
  const spec = platforms?.find((p) => p.key === key)
  return spec?.display_name || key
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`
}