export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] text-[#6b7280] gap-[12px]">
      <div className="w-[28px] h-[28px] border-[2.5px] border-[#e5e7eb] border-t-[#0F766E] rounded-full animate-spin" />
      <span className="text-[0.72rem]">{text}</span>
    </div>
  )
}
