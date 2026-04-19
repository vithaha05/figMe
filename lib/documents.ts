// PATTERN: Facade — exposes document operations through a stable API.
// The UI and routes talk to this layer, not to Supabase directly.

import { DocumentRepository, type Document as DocumentEntity } from '@/lib/repositories/DocumentRepository'

export type Document = DocumentEntity

export async function createDocument(userId: string, title: string = 'Untitled'): Promise<string> {
  return DocumentRepository.createDocument(userId, title)
}

export async function getMyDocuments(userId: string): Promise<Document[]> {
  return DocumentRepository.getMyDocuments(userId)
}

export async function getSharedDocuments(userId: string): Promise<Document[]> {
  return DocumentRepository.getSharedDocuments(userId)
}

export async function getDocument(documentId: string): Promise<Document> {
  return DocumentRepository.getDocument(documentId)
}

export async function saveCanvasState(documentId: string, canvasState: any): Promise<void> {
  return DocumentRepository.saveCanvasState(documentId, canvasState)
}

export async function updateDocumentTitle(documentId: string, title: string): Promise<void> {
  return DocumentRepository.updateDocumentTitle(documentId, title)
}

export async function deleteDocument(documentId: string): Promise<void> {
  return DocumentRepository.deleteDocument(documentId)
}

export async function updateThumbnail(documentId: string, thumbnailUrl: string): Promise<void> {
  return DocumentRepository.updateThumbnail(documentId, thumbnailUrl)
}
