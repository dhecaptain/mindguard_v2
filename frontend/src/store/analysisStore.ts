import { create } from 'zustand'
import type { Analytics, AnalysisResult } from '../types'
import { getClassification } from '../types'

interface AnalysisState {
  analytics: Analytics
  lastResult: AnalysisResult | null
  inputText: string
  inputMode: 'text' | 'image'
  setInputText: (t: string) => void
  setInputMode: (m: 'text' | 'image') => void
  setLastResult: (r: AnalysisResult | null) => void
  updateAnalytics: (prob: number, text: string) => void
  clearInput: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analytics: { total_analyses: 0, positive_count: 0, negative_count: 0, history: [] },
  lastResult: null,
  inputText: '',
  inputMode: 'text',
  setInputText: (t) => set({ inputText: t }),
  setInputMode: (m) => set({ inputMode: m }),
  setLastResult: (r) => set({ lastResult: r }),
  updateAnalytics: (prob, text) =>
    set((state) => {
      const cls = getClassification(prob)
      const entry = {
        ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cls,
        prob,
        txt: text.length > 38 ? text.slice(0, 38) + '...' : text,
      }
      const history = [entry, ...state.analytics.history].slice(0, 10)
      return {
        analytics: {
          total_analyses: state.analytics.total_analyses + 1,
          positive_count: state.analytics.positive_count + (prob >= 0.5 ? 1 : 0),
          negative_count: state.analytics.negative_count + (prob >= 0.5 ? 0 : 1),
          history,
        },
      }
    }),
  clearInput: () => set({ inputText: '', lastResult: null }),
}))
