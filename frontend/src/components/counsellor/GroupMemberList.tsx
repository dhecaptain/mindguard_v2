import type { GroupMember } from '../../types'

interface Props {
  members: GroupMember[]
  currentUserId?: string
  groupCreatorId?: string
  onRemove?: (userId: string) => void
}

export default function GroupMemberList({ members, currentUserId, groupCreatorId, onRemove }: Props) {
  return (
    <div className="space-y-[2px]">
      {members.map((m) => {
        const isCreator = m.user_id === groupCreatorId
        const isMe = m.user_id === currentUserId
        return (
          <div
            key={m.id}
            className="flex items-center gap-[10px] px-[10px] py-[7px] rounded-[8px] hover:bg-[#f9fafb] transition-colors group"
          >
            <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[#0F766E] to-[#1D9E75] flex items-center justify-center text-white font-bold text-[0.65rem] flex-shrink-0">
              {m.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[6px]">
                <span className="text-[0.78rem] font-medium text-[#1f2937] truncate">
                  {m.name}{isMe ? ' (You)' : ''}
                </span>
                {isCreator && (
                  <span className="text-[0.55rem] font-bold uppercase text-[#0F766E] bg-[#f0fdfa] px-[5px] py-[1px] rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-[0.68rem] text-[#6b7280] truncate">{m.email}</div>
            </div>
            {onRemove && !isCreator && (
              <button
                onClick={() => onRemove(m.user_id)}
                className="opacity-0 group-hover:opacity-100 w-[26px] h-[26px] flex items-center justify-center rounded-[6px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] cursor-pointer bg-transparent border-none transition-all"
                title="Remove member"
              >
                <i className="ti ti-x text-[14px]" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
