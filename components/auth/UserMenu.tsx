'use client'

import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/supabase'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserMenu() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
  }

  if (!user) {
    return null
  }

  const userInitials = user.user_metadata?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U'

  const avatarUrl = user.user_metadata?.avatar_url

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={user.user_metadata?.name || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          userInitials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {user.user_metadata?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          <button
            onClick={() => {
              router.push('/dashboard')
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User size={16} />
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
