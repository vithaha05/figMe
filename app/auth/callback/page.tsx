'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      await supabase.auth.getSession()
      router.push('/dashboard')
    }

    handleAuth()
  }, [router, supabase])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging you in...</p>
    </div>
  )
}