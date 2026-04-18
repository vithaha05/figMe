'use client'

import { signInWithGoogle, signInWithGitHub } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Github, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    await signInWithGoogle()
  }

  const handleGitHubSignIn = async () => {
    await signInWithGitHub()
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Design Studio</h1>
            <p className="text-gray-600">Collaborate in real-time on beautiful designs</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Mail size={20} />
              Continue with Google
            </button>

            <button
              onClick={handleGitHubSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 rounded-lg font-medium text-white hover:bg-gray-800 transition"
            >
              <Github size={20} />
              Continue with GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
