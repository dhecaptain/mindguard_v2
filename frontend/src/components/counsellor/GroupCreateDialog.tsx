import { useState, useEffect } from 'react'
import { createGroup } from '../../api/counsellor'
import { getStudents } from '../../api/counsellor'
import type { StudentDTO } from '../../api/counsellor'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function GroupCreateDialog({ onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [students, setStudents] = useState<StudentDTO[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getStudents().then(setStudents).catch(() => {})
  }, [])

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Group name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        member_ids: Array.from(selectedIds),
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create group')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-[16px] p-[28px] w-[480px] max-w-[95vw] shadow-2xl">
        <div className="flex items-center justify-between mb-[20px]">
          <h3 className="text-[1.05rem] font-bold text-[#1f2937]">Create Group</h3>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] text-[#6b7280] hover:bg-[#f3f4f6] cursor-pointer bg-transparent border-none"
          >
            <i className="ti ti-x text-[18px]" />
          </button>
        </div>

        {error && (
          <div className="mb-[14px] p-[10px] bg-[#fef2f2] text-[#dc2626] text-[0.8rem] rounded-[8px]">
            {error}
          </div>
        )}

        <div className="space-y-[14px]">
          <div>
            <label className="text-[0.78rem] font-semibold text-[#374151] block mb-[4px]">Group Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Freshman Support Group"
              className="w-full px-[12px] py-[8px] rounded-[8px] border border-[#e5e7eb] text-[0.82rem] outline-none focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="text-[0.78rem] font-semibold text-[#374151] block mb-[4px]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose of the group..."
              rows={2}
              className="w-full px-[12px] py-[8px] rounded-[8px] border border-[#e5e7eb] text-[0.82rem] outline-none focus:border-[#0F766E] resize-none"
            />
          </div>

          <div>
            <label className="text-[0.78rem] font-semibold text-[#374151] block mb-[4px]">
              Add Members ({selectedIds.size} selected)
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full px-[12px] py-[7px] rounded-[8px] border border-[#e5e7eb] text-[0.78rem] outline-none focus:border-[#0F766E] mb-[8px]"
            />
            <div className="max-h-[200px] overflow-y-auto border border-[#f1f5f9] rounded-[8px]">
              {filtered.length === 0 ? (
                <div className="p-[12px] text-[0.78rem] text-[#9ca3af] text-center">No students found</div>
              ) : (
                filtered.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`flex items-center gap-[10px] px-[12px] py-[8px] cursor-pointer transition-colors border-b border-[#f8fafc] ${
                      selectedIds.has(s.id) ? 'bg-[#f0fdfa]' : 'hover:bg-[#f9fafb]'
                    }`}
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                        selectedIds.has(s.id)
                          ? 'bg-[#0F766E] border-[#0F766E]'
                          : 'border-[#d1d5db]'
                      }`}
                    >
                      {selectedIds.has(s.id) && <i className="ti ti-check text-white text-[11px]" />}
                    </div>
                    <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-bold text-[0.6rem] flex-shrink-0">
                      {s.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[0.78rem] font-medium text-[#1f2937] truncate">{s.name}</div>
                      <div className="text-[0.68rem] text-[#6b7280] truncate">{s.email}</div>
                    </div>
                    <span className={`text-[0.6rem] font-semibold px-[6px] py-[2px] rounded-full ${
                      s.status === 'approved' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fef3c7] text-[#92400e]'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[10px] mt-[22px] pt-[16px] border-t border-[#f1f5f9]">
          <button
            onClick={onClose}
            className="px-[16px] py-[9px] rounded-[8px] text-[0.82rem] font-semibold text-[#6b7280] border border-[#d1d5db] cursor-pointer hover:bg-[#f9fafb] bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="px-[16px] py-[9px] rounded-[8px] text-[0.82rem] font-semibold text-white bg-[#0F766E] cursor-pointer hover:bg-[#115E59] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-[6px]"
          >
            {saving ? (
              <>
                <div className="w-[14px] h-[14px] border-[2px] border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <i className="ti ti-users-plus text-[14px]" />
                Create Group
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
