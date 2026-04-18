// PATTERN: Observer — Supabase onAuthStateChange is the event emitter.
// All UI components subscribe via useAuth() hook rather than polling.

import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export async function signInWithGoogle() {
  return getSupabaseClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
}

export async function signInWithGitHub() {
  return getSupabaseClient().auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })
}

export async function signOut() {
  return getSupabaseClient().auth.signOut()
}

// Export proxy object for backwards compatibility
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    if (prop === 'auth') {
      return getSupabaseClient().auth
    }
    if (prop === 'from') {
      return (table: string) => getSupabaseClient().from(table)
    }
    return getSupabaseClient()[prop as string]
  },
})
