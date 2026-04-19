import { supabase } from '@/lib/supabase'
import { CollaboratorRepository } from './CollaboratorRepository'
import type { Role } from '@/lib/rbac'

export interface Document {
  id: string
  title: string
  owner_id: string
  canvas_state: any
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export class DocumentRepository {
  // PATTERN: Repository — all document persistence is centralized here.
  // This prevents route/UI layers from importing Supabase directly.

  private static async getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      throw new Error('User must be authenticated')
    }
    return data.user.id
  }

  static async createDocument(userId: string, title: string = 'Untitled'): Promise<string> {
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          title,
          owner_id: userId,
          canvas_state: {},
        },
      ])
      .select('id')
      .single()

    if (error) throw error
    return data.id
  }

  static async getMyDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getSharedDocuments(userId: string): Promise<Document[]> {
    const { data: collaboratorDocs, error: collaboratorError } = await supabase
      .from('document_collaborators')
      .select('document_id')
      .eq('user_id', userId)

    if (collaboratorError) throw collaboratorError

    const documentIds = (collaboratorDocs || []).map((row: { document_id: string }) => row.document_id)
    if (documentIds.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getDocument(documentId: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error) throw error
    return data
  }

  static async saveCanvasState(documentId: string, canvasState: any): Promise<void> {
    const currentUserId = await DocumentRepository.getCurrentUserId()
    const role = await CollaboratorRepository.getUserRole(documentId, currentUserId)

    if (role === 'viewer') {
      throw new Error('Insufficient permissions to update canvas state')
    }

    const { error } = await supabase
      .from('documents')
      .update({
        canvas_state: canvasState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (error) throw error
  }

  static async updateDocumentTitle(documentId: string, title: string): Promise<void> {
    const currentUserId = await DocumentRepository.getCurrentUserId()
    const role = await CollaboratorRepository.getUserRole(documentId, currentUserId)

    if (role === 'viewer') {
      throw new Error('Insufficient permissions to update document title')
    }

    const { error } = await supabase
      .from('documents')
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (error) throw error
  }

  static async deleteDocument(documentId: string): Promise<void> {
    const currentUserId = await DocumentRepository.getCurrentUserId()
    const role = await CollaboratorRepository.getUserRole(documentId, currentUserId)

    if (role !== 'owner') {
      throw new Error('Only owners can delete documents')
    }

    const { error } = await supabase.from('documents').delete().eq('id', documentId)
    if (error) throw error
  }

  static async updateThumbnail(documentId: string, thumbnailUrl: string): Promise<void> {
    const currentUserId = await DocumentRepository.getCurrentUserId()
    const role = await CollaboratorRepository.getUserRole(documentId, currentUserId)

    if (role === 'viewer') {
      throw new Error('Insufficient permissions to update thumbnail')
    }

    const { error } = await supabase
      .from('documents')
      .update({
        thumbnail_url: thumbnailUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (error) throw error
  }
}
