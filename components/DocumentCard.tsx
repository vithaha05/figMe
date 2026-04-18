'use client'

import { Document } from '@/lib/documents'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => Promise<void>
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirm('Delete this document?')) {
      await onDelete(document.id)
    }
  }

  const formattedDate = new Date(document.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/document/${document.id}`}>
      <div className="group bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 overflow-hidden cursor-pointer">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {document.thumbnail_url ? (
            <Image
              src={document.thumbnail_url}
              alt={document.title}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-300">
                {document.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 truncate">{document.title}</h3>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{formattedDate}</p>

            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
              aria-label="Delete document"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
