'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { getDocument, saveCanvasState, updateDocumentTitle, Document } from '@/lib/documents'
import { useRBAC } from '@/hooks/useRBAC'

export const dynamic = 'force-dynamic'

export default function DocumentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const documentId = params.id as string

  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState('')

  const { role } = useRBAC(documentId)

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login')
      return
    }

    if (user) {
      loadDocument()
    }
  }, [user, authLoading, documentId, router])

  const loadDocument = async () => {
    try {
      setIsLoading(true)
      const doc = await getDocument(documentId)
      setDocument(doc)
      setEditingTitle(doc.title)
    } catch (error) {
      console.error('Failed to load document:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCanvasState = useCallback(
    async (canvasState: any) => {
      if (!document || role === 'viewer') return

      try {
        setIsSaving(true)
        await saveCanvasState(documentId, canvasState)
      } catch (error) {
        console.error('Failed to save canvas state:', error)
      } finally {
        setIsSaving(false)
      }
    },
    [document, documentId, role]
  )

  const handleUpdateTitle = async () => {
    if (!document || editingTitle === document.title) {
      setIsEditingTitle(false)
      return
    }

    try {
      await updateDocumentTitle(documentId, editingTitle)
      setDocument({ ...document, title: editingTitle })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update title:', error)
      setEditingTitle(document.title)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-6 gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white transition"
        >
          ← Dashboard
        </button>

        {isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
            autoFocus
            className="flex-1 px-3 py-1 bg-gray-700 text-white rounded text-sm"
          />
        ) : (
          <h1
            onClick={() => role !== 'viewer' && setIsEditingTitle(true)}
            className={`text-lg font-bold text-white ${
              role !== 'viewer' ? 'cursor-pointer hover:opacity-80' : ''
            }`}
          >
            {document.title}
          </h1>
        )}

        <div className="ml-auto flex items-center gap-4">
          {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
          {role && <span className="text-xs text-gray-500 capitalize">{role}</span>}
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className="flex-1 overflow-hidden"
        id="canvas-container"
      >
        {/* Existing Fabric canvas component goes here */}
      </div>
    </div>
  )
}
