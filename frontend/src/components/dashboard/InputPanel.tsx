import { useState } from 'react'
import { useAnalysisStore } from '../../store'

interface InputPanelProps {
  onAnalyze: (text: string) => void
  onImageUpload: (file: File) => void
}

export default function InputPanel({ onAnalyze, onImageUpload }: InputPanelProps) {
  const { inputText, setInputText, inputMode, setInputMode, clearInput } = useAnalysisStore()
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleAnalyze = () => {
    if (inputMode === 'text' && inputText.trim()) {
      onAnalyze(inputText)
    } else if (inputMode === 'image' && imageFile) {
      onImageUpload(imageFile)
    }
  }

  const handleSample = (text: string) => {
    setInputText(text)
    setInputMode('text')
  }

  return (
    <div className="bg-white rounded-xl border border-[rgba(229,231,235,0.7)] p-[18px_20px]">
      <div className="text-[0.9rem] font-bold text-[#1f2937] mb-[12px] pb-[10px] border-b border-[#f1f5f9] flex items-center gap-[8px]">
        <i className="ti ti-pencil text-[16px] text-[#0F766E]" />
        Input
      </div>

      {/* Mode toggle */}
      <div className="flex gap-[8px] mb-[12px]">
        <button
          onClick={() => setInputMode('text')}
          className={`flex-1 py-[7px] rounded-[8px] border text-[0.82rem] font-semibold text-center cursor-pointer transition-colors ${
            inputMode === 'text'
              ? 'bg-[#0F766E] text-white border-[#0F766E]'
              : 'bg-[#fafbfc] text-[#6b7280] border-[#e5e7eb]'
          }`}
        >
          Type Text
        </button>
        <button
          onClick={() => setInputMode('image')}
          className={`flex-1 py-[7px] rounded-[8px] border text-[0.82rem] font-semibold text-center cursor-pointer transition-colors ${
            inputMode === 'image'
              ? 'bg-[#0F766E] text-white border-[#0F766E]'
              : 'bg-[#fafbfc] text-[#6b7280] border-[#e5e7eb]'
          }`}
        >
          Upload Image
        </button>
      </div>

      {/* Input area */}
      {inputMode === 'text' ? (
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text here..."
          className="w-full bg-[#fafbfc] border-[1.5px] border-[#e5e7eb] rounded-[8px] p-[12px_14px] text-[0.82rem] text-[#4b5563] leading-[1.6] min-h-[90px] resize-vertical outline-none focus:border-[#0F766E] transition-colors"
        />
      ) : (
        <div className="bg-[#fafbfc] border-[1.5px] border-dashed border-[#e5e7eb] rounded-[8px] p-[14px] text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="text-[0.82rem] text-[#6b7280] file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-[0.8rem] file:font-semibold file:bg-[#0F766E] file:text-white cursor-pointer"
          />
          {imageFile && (
            <p className="text-[0.72rem] text-[#0F766E] mt-[8px] font-medium">{imageFile.name}</p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-[8px] mt-[10px]">
        <button
          onClick={handleAnalyze}
          disabled={inputMode === 'text' ? !inputText.trim() : !imageFile}
          className="flex-1 bg-gradient-to-r from-[#0F766E] to-[#1D9E75] text-white border-none rounded-[8px] py-[9px] text-[0.82rem] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyse
        </button>
        <button
          onClick={() => { clearInput(); setImageFile(null) }}
          className="flex-1 bg-transparent text-[#6b7280] border-[0.5px] border-[#e5e7eb] rounded-[8px] py-[9px] text-[0.82rem] font-semibold cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Samples */}
      <div className="mt-[12px] p-[10px_12px] bg-[#fafbfc] rounded-[8px] border-[0.5px] border-[#f1f5f9]">
        <div className="text-[0.68rem] text-[#9ca3af] font-bold uppercase tracking-[0.08em] mb-[6px]">
          Try a sample
        </div>
        <div
          onClick={() => handleSample('Just got promoted at work! Feeling blessed and grateful for this opportunity.')}
          className="text-[0.8rem] text-[#0F766E] font-semibold cursor-pointer hover:underline"
        >
          ▸ Positive sample
        </div>
        <div
          onClick={() => handleSample("I feel like nobody cares anymore. I am so depressed. What's the point of trying?")}
          className="text-[0.8rem] text-[#dc2626] font-semibold mt-[4px] cursor-pointer hover:underline"
        >
          ▸ Negative sample
        </div>
      </div>
    </div>
  )
}
