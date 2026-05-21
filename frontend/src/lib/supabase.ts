import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null
let _available = false

export async function initSupabase(): Promise<void> {
  try {
    const res = await fetch('/api/config')
    const { supabase_url, supabase_anon_key } = await res.json()
    if (supabase_url && supabase_anon_key) {
      _client = createClient(supabase_url, supabase_anon_key)
      _available = true
    }
  } catch {}
}

export function getSupabase(): SupabaseClient {
  return _client as SupabaseClient
}

export function isSupabaseAvailable(): boolean {
  return _available
}
