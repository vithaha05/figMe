// PATTERN: Repository — single abstraction layer over Supabase persistence.
// All DB access goes through this file. Pages/components never import supabase client directly.
// CLOUD PATTERN: Managed Database-as-a-Service with built-in RLS.
// Supabase PostgreSQL enforces per-row access control at the DB layer —
// no application-level permission checks needed for basic CRUD.

import { supabase } from './supabase'

export interface Document {
  id: string
  title: string
  owner_id: string
  canvas_state: any
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export async function createDocument(
  userId: string,
  title: string = 'Untitled'
): Promise<string> {
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

export async function getMyDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSharedDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .in(
      'id',
      (
        await supabase
          .from('document_collaborators')
          .select('document_id')
          .eq('user_id', userId)
      ).data?.map((d) => d.document_id) || []
    )
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDocument(documentId: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (error) throw error
  return data
}

export async function saveCanvasState(
  documentId: string,
  canvasState: any
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({
      canvas_state: canvasState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) throw error
}

export async function updateDocumentTitle(
  documentId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) throw error
}

export async function deleteDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) throw error
}

export async function updateThumbnail(
  documentId: string,
  thumbnailUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({
      thumbnail_url: thumbnailUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) throw error
}
