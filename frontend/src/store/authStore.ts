import { create } from 'zustand'
import type { UserInfo } from '../types'

interface AuthState {
  authenticated: boolean
  user: UserInfo | null
  termsAccepted: boolean
  loading: boolean
  setAuth: (user: UserInfo) => void
  setTermsAccepted: (v: boolean) => void
  setLoading: (v: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  authenticated: false,
  user: null,
  termsAccepted: false,
  loading: true,
  setAuth: (user) => set({ authenticated: true, user, loading: false }),
  setTermsAccepted: (v) => set({ termsAccepted: v }),
  setLoading: (v) => set({ loading: v }),
  logout: () =>
    set({
      authenticated: false,
      user: null,
      termsAccepted: false,
      loading: false,
    }),
}))
