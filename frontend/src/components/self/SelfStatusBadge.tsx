export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical' | 'running'

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-[#d1fae5] text-[#065f46]',
  warning: 'bg-[#fef3c7] text-[#92400e]',
  danger: 'bg-[#fee2e2] text-[#991b1b]',
  info: 'bg-[#e0f2fe] text-[#075985]',
  neutral: 'bg-[#f3f4f6] text-[#4b5563]',
  critical: 'bg-[#fecaca] text-[#7f1d1d]',
  running: 'bg-[#e0f2fe] text-[#075985]',
}

interface Props {
  tone: BadgeTone
  children: React.ReactNode
  pulse?: boolean
  title?: string
}

export default function SelfStatusBadge({ tone, children, pulse, title }: Props) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-[5px] rounded-full px-[8px] py-[3px] text-[0.68rem] font-semibold uppercase tracking-wide whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {pulse && (
        <span className="relative flex h-[6px] w-[6px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F766E] opacity-60" />
          <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-[#0F766E]" />
        </span>
      )}
      {children}
    </span>
  )
}