import { useState, useEffect } from 'react'
import { getTeamMembers } from '../api/resources'
import type { TeamMember } from '../types'

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    getTeamMembers().then(setMembers).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[0.65rem] font-bold text-[#0F766E] uppercase tracking-[0.08em]">
            MindGuard team
          </div>
          <h2 className="text-[1.1rem] font-bold text-[#1f2937] mt-[2px]">People behind the research workspace</h2>
          <p className="text-[0.72rem] text-[#6b7280]">Clinical care, model evaluation, data quality, and product engineering come together.</p>
        </div>
        <div className="bg-[#f1f5f9] text-[#6b7280] px-[10px] py-[4px] rounded-full text-[0.6rem] font-bold uppercase">
          Research use only
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[14px]">
        {members.map((member, i) => (
          <div key={i} className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[16px_14px] text-center">
            <img
              src={member.image}
              alt={member.name}
              className="w-[64px] h-[64px] rounded-full object-cover mx-auto mb-[10px] border-2 border-[#f1f5f9]"
            />
            <div className="text-[0.8rem] font-bold text-[#1f2937]">{member.name}</div>
            <div className="text-[0.65rem] text-[#0F766E] font-semibold mt-[2px]">{member.role}</div>
            <p className="text-[0.65rem] text-[#6b7280] mt-[6px] leading-[1.5]">{member.bio}</p>
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-[8px] text-[0.65rem] text-[#0F766E] hover:underline font-medium"
              >
                View LinkedIn →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
