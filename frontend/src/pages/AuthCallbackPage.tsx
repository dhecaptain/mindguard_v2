import { useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase'
import { useAuthStore } from '../store'
import { googleLogin } from '../api/auth'

export default function AuthCallbackPage() {
  const { setAuth, setTermsAccepted } = useAuthStore()
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Completing sign in...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await getSupabase().auth.getSession()
        if (sessionError) throw sessionError
        if (!session) throw new Error('No session found')

        setStatus('Verifying with MindGuard...')
        const supabaseToken = session.access_token
        const email = session.user.email || ''
        const name = session.user.user_metadata?.full_name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())

        const user = await googleLogin(supabaseToken, email, name)
        setAuth(user)
        setTermsAccepted(true)

        window.location.href = '/'
      } catch (err: any) {
        setError(err.message || 'Authentication failed')
      }
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-[24px]">
        <div className="bg-white rounded-xl p-[32px] max-w-[400px] w-full text-center border border-[rgba(229,231,235,0.7)]">
          <div className="w-[48px] h-[48px] mx-auto mb-[16px] rounded-full bg-[#fee2e2] flex items-center justify-center">
            <i className="ti ti-alert-circle text-[#dc2626] text-[24px]" />
          </div>
          <h2 className="text-[1.1rem] font-bold text-[#1f2937] mb-[6px]">Sign In Failed</h2>
          <p className="text-[0.82rem] text-[#6b7280] mb-[16px]">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-[20px] py-[9px] bg-[#0F766E] text-white rounded-[8px] text-[0.85rem] font-semibold cursor-pointer border-none hover:bg-[#115E59]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-[24px]">
      <div className="flex flex-col items-center gap-[16px]">
        <div className="w-[40px] h-[40px] border-[2.5px] border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin" />
        <span className="text-[0.9rem] text-[#6b7280]">{status}</span>
      </div>
    </div>
  )
}
