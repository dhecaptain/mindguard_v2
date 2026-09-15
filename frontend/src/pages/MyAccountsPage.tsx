import { useState, useEffect } from 'react'
import api from '../api/client'

interface Account { platform: string; handle: string; profile_url: string; active: number }

export default function MyAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [platform, setPlatform] = useState('Instagram')
  const [handle, setHandle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/self/social-accounts').then(({ data }) => setAccounts(data.accounts || [])).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    setError(null)
    setSaving(true)
    try {
      await api.post('/self/social-accounts', { platform, handle, profile_url: url })
      setHandle(''); setUrl('')
      load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed') }
    setSaving(false)
  }

  const handleDelete = async (p: string) => {
    await api.delete(`/self/social-accounts/${p}`)
    load()
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div>
        <h2 className="text-[1.3rem] font-bold text-[#1f2937]">My Connected Accounts</h2>
        <p className="text-[0.82rem] text-[#6b7280] mt-[4px]">Your connected accounts — only your own or explicitly authorized accounts. You cannot analyze arbitrary third-party handles.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] p-[20px]">
        <h3 className="text-[0.95rem] font-bold text-[#1f2937] mb-[12px]">Add account</h3>
        <div className="flex flex-col sm:flex-row gap-[10px]">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]">
            {['Instagram','X','Facebook','LinkedIn','TikTok','Mastodon','Bluesky','YouTube','Reddit'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="handle (e.g. @yourname)" className="flex-1 bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="profile URL (optional)" className="flex-1 bg-[#fafbfc] border border-[#e5e7eb] rounded-[8px] px-[12px] py-[9px] text-[0.85rem]" />
          <button onClick={handleAdd} disabled={saving} className="px-[16px] py-[9px] bg-[#0F766E] text-white rounded-[8px] text-[0.85rem] font-semibold disabled:opacity-50">Add</button>
        </div>
        {error && <div className="mt-[10px] px-[12px] py-[8px] bg-[#fee2e2] border border-[#fca5a5] rounded-[8px] text-[0.78rem] text-[#991b1b]">{error}</div>}
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] p-[20px]">
        <h3 className="text-[0.95rem] font-bold text-[#1f2937] mb-[12px]">Connected accounts ({accounts.length})</h3>
        {loading ? <div className="text-[0.82rem] text-[#6b7280]">Loading...</div> : accounts.length === 0 ? <div className="text-[0.82rem] text-[#6b7280]">No accounts yet. Add your own accounts above.</div> : (
          <div className="flex flex-col gap-[8px]">
            {accounts.map(a => (
              <div key={a.platform} className="flex items-center justify-between p-[12px] bg-[#f8fafc] rounded-[8px] border border-[#e5e7eb]">
                <div>
                  <div className="text-[0.85rem] font-semibold text-[#1f2937]">{a.platform}</div>
                  <div className="text-[0.78rem] text-[#6b7280]">{a.handle || a.profile_url}</div>
                </div>
                <button onClick={() => handleDelete(a.platform)} className="text-[0.75rem] text-[#dc2626] hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
