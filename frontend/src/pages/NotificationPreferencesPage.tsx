import { useEffect, useState } from 'react'
import { useNotificationStore } from '../store'
import { getMyConversations } from '../api/counsellor'
import { NOTIFICATION_TYPE_LABELS, NOTIFICATION_TYPE_ICONS } from '../types'
import type { GroupConversationPreview } from '../types'

export default function NotificationPreferencesPage() {
  const { preferences, fetchPreferences, updatePreference, toggleGroupMute } = useNotificationStore()
  const [groupConversations, setGroupConversations] = useState<GroupConversationPreview[]>([])

  useEffect(() => {
    fetchPreferences()
    getMyConversations().then((data) => {
      setGroupConversations(data.groups || [])
    }).catch(() => {})
  }, [fetchPreferences])

  const groupMessagePref = preferences.find((p) => p.type === 'group_message')
  const mutedGroups = groupMessagePref?.muted_groups || []

  return (
    <div className="flex flex-col gap-[16px] max-w-[600px]">
      <div>
        <h2 className="text-[1.3rem] font-bold text-[#1f2937]">Notification Preferences</h2>
        <p className="text-[0.82rem] text-[#6b7280] mt-[2px]">
          Choose which notifications you receive and how
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
        <div className="px-[18px] py-[12px] border-b border-[#f1f5f9]">
          <span className="text-[0.85rem] font-bold text-[#1f2937]">Notification Types</span>
        </div>
        <div className="divide-y divide-[#f8fafc]">
          {preferences.map((pref) => {
            const icon = NOTIFICATION_TYPE_ICONS[pref.type] || 'ti ti-bell'
            const label = NOTIFICATION_TYPE_LABELS[pref.type] || pref.type
            return (
              <div key={pref.type} className="px-[18px] py-[14px] flex items-center gap-[14px]">
                <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center ${
                  pref.type === 'alert' ? 'bg-[#fef2f2] text-[#dc2626]' :
                  pref.type === 'group_message' ? 'bg-[#f5f3ff] text-[#7c3aed]' :
                  pref.type === 'message' ? 'bg-[#f0fdfa] text-[#0F766E]' :
                  pref.type === 'broadcast' ? 'bg-[#fef3c7] text-[#d97706]' :
                  'bg-[#f3f4f6] text-[#6b7280]'
                }`}>
                  <i className={`${icon} text-[16px]`} />
                </div>
                <div className="flex-1">
                  <div className="text-[0.85rem] font-semibold text-[#1f2937]">{label}</div>
                  <div className="text-[0.72rem] text-[#6b7280]">
                    {pref.type === 'message' && 'New direct messages from other users'}
                    {pref.type === 'group_message' && 'Messages sent to groups you belong to'}
                    {pref.type === 'alert' && 'Risk alerts triggered for students'}
                    {pref.type === 'referral' && 'Referral created or updated'}
                    {pref.type === 'broadcast' && 'Admin broadcast announcements'}
                    {pref.type === 'consent' && 'Consent dispatched, accepted, or expired'}
                    {pref.type === 'approval' && 'Account approval or revocation status'}
                    {pref.type === 'system' && 'System notifications like minor registrations'}
                  </div>
                </div>
                <button
                  onClick={() => updatePreference(pref.type, !pref.enabled)}
                  className={`relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer border-none ${
                    pref.enabled ? 'bg-[#0F766E]' : 'bg-[#d1d5db]'
                  }`}
                >
                  <div className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform ${
                    pref.enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                  }`} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Muted groups section */}
      {groupConversations.length > 0 && (
        <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] overflow-hidden">
          <div className="px-[18px] py-[12px] border-b border-[#f1f5f9]">
            <span className="text-[0.85rem] font-bold text-[#1f2937]">Muted Groups</span>
            <span className="text-[0.72rem] text-[#6b7280] ml-[8px]">
              Group notifications you've silenced
            </span>
          </div>
          {mutedGroups.length === 0 ? (
            <div className="px-[18px] py-[20px] text-[0.8rem] text-[#9ca3af] text-center">
              No groups are muted. Toggle mute from a group's member panel or here.
            </div>
          ) : (
            <div className="divide-y divide-[#f8fafc]">
              {mutedGroups.map((gid) => {
                const group = groupConversations.find((g) => g.group_id === gid)
                return (
                  <div key={gid} className="px-[18px] py-[10px] flex items-center justify-between">
                    <span className="text-[0.82rem] text-[#1f2937] font-medium">
                      {group?.name || gid}
                    </span>
                    <button
                      onClick={() => toggleGroupMute(gid, false)}
                      className="px-[10px] py-[5px] text-[0.72rem] font-semibold text-[#0F766E] bg-[#f0fdfa] rounded-[6px] cursor-pointer hover:bg-[#d1fae5] border-none"
                    >
                      Unmute
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Info card */}
      <div className="bg-[#f0fdfa] rounded-[12px] p-[16px] flex items-start gap-[10px]">
        <i className="ti ti-info-circle text-[#0F766E] text-[18px] mt-[1px]" />
        <div className="text-[0.78rem] text-[#065f46]">
          <strong>Notification behavior:</strong> Notifications are polled every 30 seconds. 
          Preferences take effect immediately. Muted groups will still appear in your group list 
          but won't generate notification entries.
        </div>
      </div>
    </div>
  )
}
