'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getUserRole, getRoleStrategy, Role, RoleStrategy } from '@/lib/rbac'

export function useRBAC(documentId: string) {
  const { user } = useAuth()
  const [role, setRole] = useState<Role | null>(null)
  const [strategy, setStrategy] = useState<RoleStrategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchRole = async () => {
      try {
        setLoading(true)
        const userRole = await getUserRole(documentId, user.id)
        setRole(userRole)
        setStrategy(getRoleStrategy(userRole))
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [documentId, user])

  return { role, strategy, loading, error }
}
