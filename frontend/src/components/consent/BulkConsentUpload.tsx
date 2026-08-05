import { useCallback, useEffect, useRef, useState } from 'react'
import { commitRoster, getInstitutions, uploadRoster } from '../../api/admin'
import RosterErrorReport from './RosterErrorReport'
import type { Institution, RosterDispatchSummary, RosterUploadSummary } from '../../types'

export default function BulkConsentUpload({
  onDispatched,
}: {
  onDispatched?: () => void
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [institutionId, setInstitutionId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sendOnUpload, setSendOnUpload] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [summary, setSummary] = useState<RosterUploadSummary | null>(null)
  const [dispatch, setDispatch] = useState<RosterDispatchSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadInstitutions = useCallback(async () => {
    try {
      const insts = await getInstitutions()
      setInstitutions(insts)
      if (insts.length > 0 && !institutionId) setInstitutionId(insts[0].id)
    } catch (e: any) {
      setError(e.message)
    }
  }, [institutionId])

  useEffect(() => { loadInstitutions() }, [loadInstitutions])

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    if (!/\.csv$/i.test(f.name) && f.type !== 'text/csv') {
      setError('Please choose a .csv file.')
      return
    }
    setError(null)
    setFile(f)
    setSummary(null)
    setDispatch(null)
  }

  const handleUpload = async () => {
    if (!file || !institutionId) return
    setUploading(true)
    setSummary(null)
    setDispatch(null)
    setError(null)
    try {
      if (sendOnUpload) {
        const result = await commitRoster(file, institutionId)
        setSummary(result.roster)
        setDispatch(result.dispatch)
      } else {
        setSummary(await uploadRoster(file, institutionId))
      }
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      onDispatched?.()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-[14px]">
      <div>
        <label className="block text-[0.78rem] font-semibold text-[#374151] mb-[4px]">Institution *</label>
        <select
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className="w-full rounded-[8px] border border-[#e5e7eb] px-[10px] py-[8px] text-[0.82rem] text-[#1f2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        >
          <option value="">Select institution...</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      {/* CSV drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-[6px] rounded-[10px] border-2 border-dashed px-[16px] py-[24px] text-center transition-colors ${
          dragging ? 'border-[#0F766E] bg-[#f0fdfa]' : 'border-[#e5e7eb] bg-[#f9fafb] hover:border-[#0F766E]'
        }`}
      >
        <i className="ti ti-cloud-upload text-[24px] text-[#0F766E]" />
        {file ? (
          <span className="text-[0.82rem] font-semibold text-[#1f2937]">{file.name}</span>
        ) : (
          <>
            <span className="text-[0.82rem] font-semibold text-[#374151]">
              Drop your roster CSV here, or click to browse
            </span>
            <span className="text-[0.7rem] text-[#9ca3af]">
              Required: student_id, student_first_name, student_email, date_of_birth
            </span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <label className="flex items-center gap-[8px] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={sendOnUpload}
          onChange={(e) => setSendOnUpload(e.target.checked)}
          className="w-[15px] h-[15px] accent-[#0F766E] cursor-pointer"
        />
        <span className="text-[0.8rem] text-[#374151]">
          Send consent requests immediately (one-action upload + dispatch)
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-[6px] text-[#ef4444] text-[0.82rem]">
          <i className="ti ti-alert-circle" /> {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || !institutionId || uploading}
        className="flex items-center justify-center gap-[6px] px-[14px] py-[8px] bg-[#0F766E] text-white rounded-[8px] text-[0.82rem] font-semibold cursor-pointer hover:bg-[#0d5c56] transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <div className="w-[14px] h-[14px] border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <i className="ti ti-send text-[14px]" />
        )}
        {uploading ? 'Uploading...' : sendOnUpload ? 'Upload & send consents' : 'Upload roster'}
      </button>

      {summary && (
        <div className={`rounded-[10px] border px-[14px] py-[10px] text-[0.82rem] ${
          summary.parse_error
            ? 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412]'
            : 'bg-[#ecfdf5] border-[#bbf7d0] text-[#065f46]'
        }`}>
          <div className="font-bold mb-[2px]">
            {summary.parse_error ? 'Roster rejected' : 'Upload complete'}
          </div>
          {summary.parse_error && <div className="mb-[6px]">{summary.parse_error}</div>}
          <div>
            {summary.created} created · {summary.updated} updated · {summary.total} total
            {summary.errors.length ? ` · ${summary.errors.length} row(s) failed` : ''}
          </div>
          <RosterErrorReport summary={summary} />
        </div>
      )}

      {dispatch && (
        <div className="rounded-[10px] bg-[#eff6ff] border border-[#bfdbfe] px-[14px] py-[10px] text-[0.82rem] text-[#1e40af]">
          <div className="font-bold mb-[2px]">Consent dispatch</div>
          <div>
            {dispatch.dispatched} request(s) dispatched · {dispatch.email_sent} email(s) sent ·{' '}
            {dispatch.courtesy_sent} courtesy copy/copies
            {dispatch.email_failed ? ` · ${dispatch.email_failed} email(s) failed` : ''}
          </div>
          <div className="mt-[2px] text-[0.76rem] text-[#64748b]">
            {dispatch.skipped_live} already consented · {dispatch.skipped_no_parent} minor(s) without parent email
            {dispatch.users_created ? ` · ${dispatch.users_created} account(s) created` : ''}
          </div>
          {dispatch.routing_errors.length > 0 && (
            <div className="mt-[6px] max-h-[120px] overflow-y-auto text-[0.76rem] text-[#991b1b]">
              {dispatch.routing_errors.slice(0, 10).map((e, i) => (
                <div key={i}>{e.student_id} — {e.reason}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
