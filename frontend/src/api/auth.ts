import api from './client'
import type { UserInfo } from '../types'

export async function login(email: string, password: string): Promise<UserInfo & { access_token: string }> {
  const { data } = await api.post('/auth/login', { email, password })
  if (data.access_token) {
    localStorage.setItem('mg_token', data.access_token)
  }
  return data
}

export async function register(params: {
  name: string
  email: string
  password: string
  role: string
  dob?: string
  parent_email?: string
  referred_by?: string
}): Promise<void> {
  await api.post('/auth/register', params)
}

export async function getMe(): Promise<UserInfo> {
  const { data } = await api.get('/auth/me')
  return data
}

export async function acceptTerms(): Promise<void> {
  await api.post('/auth/terms')
}

export async function logout(): Promise<void> {
  localStorage.removeItem('mg_token')
  await api.post('/auth/logout')
}

export async function googleLogin(supabaseToken: string, email?: string, name?: string): Promise<UserInfo & { access_token: string }> {
  const { data } = await api.post('/auth/google', { access_token: supabaseToken, email, name })
  if (data.access_token) {
    localStorage.setItem('mg_token', data.access_token)
  }
  return data
}

export async function getNotifications(): Promise<{ notifications: any[]; unread_count: number }> {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.post('/notifications/read', { id })
}

export async function broadcastNotification(title: string, message: string, target_role?: string): Promise<{ sent: number }> {
  const { data } = await api.post('/admin/broadcast', { title, message, target_role: target_role || null })
  return data
}
