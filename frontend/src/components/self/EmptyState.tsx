interface Props {
  icon: string
  title: string
  body: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, body, action }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-[32px] flex flex-col items-center text-center">
      <div className="w-[52px] h-[52px] rounded-full bg-[#f0fdfa] flex items-center justify-center mb-[14px]">
        <i className={`${icon} text-[24px] text-[#0F766E]`} />
      </div>
      <h3 className="text-[1rem] font-bold text-[#1f2937] mb-[6px]">{title}</h3>
      <p className="text-[0.82rem] text-[#6b7280] max-w-[420px] mb-[16px] leading-relaxed">{body}</p>
      {action}
    </div>
  )
}