import { getRiskLabel } from '../../types'

interface RiskBadgeProps {
  score: number
}

export default function RiskBadge({ score }: RiskBadgeProps) {
  const { label, color } = getRiskLabel(score)
  return (
    <span
      className="inline-block px-[10px] py-[3px] rounded-full text-[0.7rem] font-bold uppercase tracking-wide"
      style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}
