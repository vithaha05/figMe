'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dynamically import supabase to avoid build-time initialization
    import('@/lib/supabase').then(({ supabase }) => {
      // Check current session
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // PATTERN: Observer — subscribe to auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription?.unsubscribe()
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
