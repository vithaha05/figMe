// CLOUD PATTERN: Backend-as-a-Service (BaaS)
// Authentication is fully delegated to Supabase cloud infrastructure.
// No auth server to maintain — scales automatically with zero ops overhead.

import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get: (name: string) => {
          const cookie = request.cookies.get(name)
          return cookie?.value ?? null
        },
        set: (name: string, value: string, options) => {
          res.cookies.set(name, value, options)
        },
        remove: (name: string, options) => {
          res.cookies.delete(name, options)
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Allow unauthenticated access to login and auth callback
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/auth/')) {
    return res
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
