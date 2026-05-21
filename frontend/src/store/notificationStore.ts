import { create } from 'zustand'
import type { NotificationPreference } from '../types'
import {
  getNotifications as apiGetNotifications,
  markNotificationRead as apiMarkRead,
} from '../api/auth'
import {
  getNotificationPreferences as apiGetPrefs,
  updateNotificationPreference as apiUpdatePref,
  toggleGroupMute as apiToggleMute,
} from '../api/counsellor'

interface BackendNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

interface NotificationState {
  notifications: BackendNotification[]
  unreadCount: number
  preferences: NotificationPreference[]
  loading: boolean
  fetchNotifications: () => Promise<void>
  markRead: (id: string) => void
  markAllRead: () => Promise<void>
  fetchPreferences: () => Promise<void>
  updatePreference: (type: string, enabled: boolean) => Promise<void>
  toggleGroupMute: (groupId: string, muted: boolean) => Promise<void>
  isGroupMuted: (groupId: string) => boolean
  unreadByType: () => Record<string, number>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: [],
  loading: false,

  fetchNotifications: async () => {
    try {
      const data = await apiGetNotifications()
      const notifs = data.notifications || []
      set({
        notifications: notifs,
        unreadCount: notifs.filter((n: BackendNotification) => !n.read).length,
      })
    } catch {}
  },

  markRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      }
    })
    apiMarkRead(id).catch(() => {})
  },

  markAllRead: async () => {
    const unread = get().notifications.filter((n) => !n.read)
    for (const n of unread) {
      apiMarkRead(n.id).catch(() => {})
    }
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  fetchPreferences: async () => {
    try {
      const data = await apiGetPrefs()
      set({ preferences: data.preferences || [] })
    } catch {}
  },

  updatePreference: async (type: string, enabled: boolean) => {
    try {
      await apiUpdatePref(type, { enabled })
      set((state) => ({
        preferences: state.preferences.map((p) =>
          p.type === type ? { ...p, enabled } : p
        ),
      }))
    } catch {}
  },

  toggleGroupMute: async (groupId: string, muted: boolean) => {
    try {
      const resp = await apiToggleMute(groupId, muted)
      set((state) => ({
        preferences: state.preferences.map((p) =>
          p.type === 'group_message' ? { ...p, muted_groups: resp.muted_groups } : p
        ),
      }))
    } catch {}
  },

  isGroupMuted: (groupId: string) => {
    const groupPref = get().preferences.find((p) => p.type === 'group_message')
    return groupPref ? groupPref.muted_groups.includes(groupId) : false
  },

  unreadByType: () => {
    const result: Record<string, number> = {}
    for (const n of get().notifications) {
      if (!n.read) {
        result[n.type] = (result[n.type] || 0) + 1
      }
    }
    return result
  },
}))
