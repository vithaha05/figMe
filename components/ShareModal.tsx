'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addCollaborator, getCollaborators, removeCollaborator, Role } from '@/lib/rbac'

interface ShareModalProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ documentId, isOpen, onClose }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('editor')
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsLoading(true)
      setError(null)
      await addCollaborator(documentId, email, role)
      setEmail('')
      setRole('editor')
      // Reload collaborators
      const updated = await getCollaborators(documentId)
      setCollaborators(updated)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await removeCollaborator(documentId, userId)
      const updated = await getCollaborators(documentId)
      setCollaborators(updated)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Share Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Collaborator Form */}
          <form onSubmit={handleAddCollaborator} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Collaborator'}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Collaborators List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Collaborators
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collaborators.map((collab) => (
                <div
                  key={collab.user_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {collab.name}
                    </p>
                    <p className="text-xs text-gray-500">{collab.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {collab.role}
                    </span>
                    {collab.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveCollaborator(collab.user_id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
