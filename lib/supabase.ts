import { createBrowserClient } from '@supabase/ssr'

// Single instance — createBrowserClient manages cookies automatically
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`
  }
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${url.startsWith('http') ? url : `https://${url}`}/auth/callback`
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getRedirectUrl() },
  })
}

export async function signInWithGitHub() {
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: getRedirectUrl() },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}