import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store'
import { useUiStore } from '../../store'
import { login, register } from '../../api/auth'
import { supabase } from '../../lib/supabase'

interface SignInPageProps {
  onSuccess: () => void
}

export default function SignInPage({ onSuccess }: SignInPageProps) {
  const { setAuth } = useAuthStore()
  const setPage = useUiStore((s) => s.setPage)
  const [tab, setTab] = useState<'signin' | 'register'>('signin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('student')
  const [regDob, setRegDob] = useState('')
  const [regParentEmail, setRegParentEmail] = useState('')
  const [regReferredBy, setRegReferredBy] = useState('')
  const [isMinor, setIsMinor] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Read ?ref= referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setRegReferredBy(ref.toUpperCase())
      setTab('register')
    }
  }, [])

  const fillDemo = (role: string) => {
    setEmail(`${role}@mindguard.org`)
    setPassword('password')
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      setAuth(user)
      const rt = user.role_type?.toLowerCase()
      if (rt === 'counsellor') setPage('counsellor-dashboard')
      else if (rt === 'admin') setPage('admin')
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setError('')
    if (isMinor && !regParentEmail) {
      setError('A parent or guardian email is required for students under 18')
      return
    }
    setLoading(true)
    try {
      await register({
        name: regName, email: regEmail, password: regPassword,
        role: regRole, dob: regDob || undefined,
        parent_email: isMinor ? regParentEmail : undefined,
        referred_by: regReferredBy || undefined,
      })
      setTab('signin')
      setEmail(regEmail)
      setPassword('')
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-[24px]">
      <div className="flex max-w-[1060px] w-full bg-white rounded-[16px] overflow-hidden shadow-sm border border-[rgba(229,231,235,0.5)]">
        {/* Left panel */}
        <div className="w-[380px] bg-gradient-to-br from-[#0a1f1d] to-[#0d322e] p-[36px] flex flex-col justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-[12px] mb-[28px]">
              <div className="w-[40px] h-[40px] rounded-lg bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-extrabold text-[0.9rem]">
                MG
              </div>
              <span className="text-white text-[1.1rem] font-bold">MindGuard</span>
            </div>
            <h1 className="text-white text-[1.5rem] font-bold leading-[1.3] mb-[12px]">
              Consent-first clinical decision support
            </h1>
            <p className="text-[#94a3b8] text-[0.85rem] leading-[1.6]">
              Powered by Mental-RoBERTa. Human-in-the-loop. Research use only.
            </p>
          </div>
          <div className="flex flex-wrap gap-[8px]">
            {['HIPAA-aligned', '92.5% accuracy', '12.6K trained', 'Ethics approved'].map((pill) => (
              <span
                key={pill}
                className="px-[10px] py-[4px] rounded-full text-[0.65rem] font-semibold bg-[rgba(15,118,110,0.2)] text-[#34d399] border border-[rgba(52,211,153,0.15)]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-[44px]">
          {/* Tabs */}
          <div className="flex mb-[28px] border-b border-[#f1f5f9]">
            <button
              onClick={() => { setTab('signin'); setError('') }}
              className={`pb-[10px] px-[20px] text-[0.9rem] font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'signin'
                  ? 'text-[#0F766E] border-[#0F766E]'
                  : 'text-[#94a3b8] border-transparent hover:text-[#6b7280]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className={`pb-[10px] px-[20px] text-[0.9rem] font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'register'
                  ? 'text-[#0F766E] border-[#0F766E]'
                  : 'text-[#94a3b8] border-transparent hover:text-[#6b7280]'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[8px] p-[10px_14px] text-[0.82rem] text-[#991b1b] mb-[14px]">
              {error}
            </div>
          )}

          {tab === 'signin' ? (
            <div className="space-y-[14px]">
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[10px] text-[0.9rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[10px] text-[0.9rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={!email || !password || loading}
                className="w-full bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[8px] py-[11px] text-[0.9rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-[6px]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="pt-[6px]">
                <div className="text-[0.68rem] text-[#9ca3af] font-semibold uppercase tracking-[0.06em] mb-[8px]">Demo accounts</div>
                <div className="flex gap-[8px] flex-wrap">
                  {[
                    { label: 'Counselor', email: 'demo@mindguard.org' },
                    { label: 'Student', email: 'student@mindguard.org' },
                  ].map((d) => (
                    <button
                      key={d.label}
                      onClick={() => fillDemo(d.email.split('@')[0])}
                      className="px-[12px] py-[6px] text-[0.78rem] font-medium bg-[#f1f5f9] text-[#374151] rounded-[6px] border border-[#e5e7eb] cursor-pointer hover:bg-[#e5e7eb] transition-colors"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                <p className="text-[0.68rem] text-[#9ca3af] mt-[6px]">Any password works in dev mode</p>
              </div>

              <div className="relative my-[18px]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e5e7eb]" />
                </div>
                <div className="relative flex justify-center text-[0.72rem]">
                  <span className="bg-white px-[10px] text-[#9ca3af]">or continue with</span>
                </div>
              </div>

              <button
                onClick={() => supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                })}
                className="w-full flex items-center justify-center gap-[10px] py-[10px] rounded-[8px] border border-[#d1d5db] bg-white text-[#374151] text-[0.85rem] font-medium cursor-pointer hover:bg-[#f9fafb] transition-colors"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="space-y-[12px] max-h-[460px] overflow-y-auto pr-[4px]">
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Role</label>
                <select
                  value={regRole}
                  onChange={(e) => { setRegRole(e.target.value); setIsMinor(false); setRegDob('') }}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                >
                  <option value="student">Student</option>
                  <option value="counsellor">Counsellor</option>
                </select>
              </div>
              <div>
                <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Referral Code <span className="text-[#9ca3af] normal-case font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={regReferredBy}
                  onChange={(e) => setRegReferredBy(e.target.value.toUpperCase())}
                  className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E] tracking-wider"
                  placeholder="e.g. AB3X7R2K"
                  maxLength={8}
                />
              </div>
              {regRole === 'student' && (
                <>
                  <div>
                    <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">Date of Birth</label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => {
                        setRegDob(e.target.value)
                        const birth = new Date(e.target.value)
                        const now = new Date()
                        const age = now.getFullYear() - birth.getFullYear()
                        setIsMinor(age < 18)
                      }}
                      className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  {isMinor && (
                    <>
                      <div className="flex items-start gap-[8px] bg-[#fef3c7] border border-[#fde68a] rounded-[8px] px-[12px] py-[8px] text-[0.78rem] text-[#92400e]">
                        <i className="ti ti-info-circle text-[14px] mt-[1px] flex-shrink-0" />
                        A parent or guardian must provide consent for users under 18. A notification will be sent to their email.
                      </div>
                      <div>
                        <label className="text-[0.7rem] font-bold text-[#374151] uppercase tracking-[0.06em] mb-[6px] block">
                          Parent/Guardian Email <span className="text-[#ef4444]">*</span>
                        </label>
                        <input
                          type="email"
                          value={regParentEmail}
                          onChange={(e) => setRegParentEmail(e.target.value)}
                          className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] px-[14px] py-[9px] text-[0.85rem] text-[#4b5563] outline-none focus:border-[#0F766E]"
                          placeholder="parent@example.com"
                          required
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              <button
                onClick={handleRegister}
                disabled={!regName || !regEmail || !regPassword || loading}
                className="w-full bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[8px] py-[11px] text-[0.9rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-[6px]"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
