'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  createDocument,
  getMyDocuments,
  getSharedDocuments,
  deleteDocument,
  Document,
} from '@/lib/documents'
import { DocumentCard } from '@/components/DocumentCard'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [myDocuments, setMyDocuments] = useState<Document[]>([])
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login')
      return
    }

    if (user) {
      loadDocuments()
    }
  }, [user, loading, router])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const [myDocs, sharedDocs] = await Promise.all([
        getMyDocuments(user!.id),
        getSharedDocuments(user!.id),
      ])
      setMyDocuments(myDocs)
      setSharedDocuments(sharedDocs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDocument = async () => {
    try {
      setIsCreating(true)
      const documentId = await createDocument(user!.id, 'Untitled')
      router.push(`/document/${documentId}`)
    } catch (error) {
      console.error('Failed to create document:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id)
      await loadDocuments()
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.user_metadata?.name || user?.email}
              </p>
            </div>

            <button
              onClick={handleCreateDocument}
              disabled={isCreating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Plus size={20} />
              New Document
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* My Documents */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Documents</h2>
          {myDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600">No documents yet. Create your first one!</p>
            </div>
          )}
        </section>

        {/* Shared Documents */}
        {sharedDocuments.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shared with Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={async () => {
                    /* Shared docs can't be deleted by non-owners */
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
