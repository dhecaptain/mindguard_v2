import api from './client'
import type { CrisisResource, TeamMember } from '../types'

export async function getResources(): Promise<Record<string, CrisisResource[]>> {
  const { data } = await api.get('/resources')
  return data
}

export async function getStateResources(): Promise<Record<string, CrisisResource[]>> {
  const { data } = await api.get('/resources/states')
  return data
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data } = await api.get('/resources/team')
  return data
}
