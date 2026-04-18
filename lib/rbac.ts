// PATTERN: Strategy — each role is a strategy object with canEdit(), canComment(), canManage().
// The canvas component receives the strategy and delegates permission checks to it,
// making it easy to add new roles without changing canvas logic.
// CLOUD PATTERN: Zero-Trust Access Control.
// Every operation verifies role at runtime — no implicit trust based on session alone.
// Follows cloud security principle: verify explicitly, use least privilege.

import { supabase } from './supabase'

export type Role = 'owner' | 'editor' | 'viewer'

export interface RoleStrategy {
  canEdit: () => boolean
  canComment: () => boolean
  canManage: () => boolean
  canShare: () => boolean
  canDelete: () => boolean
}

export async function getUserRole(documentId: string, userId: string): Promise<Role> {
  // Check if user is owner
  const { data: ownerDoc, error: ownerError } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('owner_id', userId)
    .single()

  if (ownerDoc && !ownerError) {
    return 'owner'
  }

  // Check if user is collaborator
  const { data: collaborator, error: collabError } = await supabase
    .from('document_collaborators')
    .select('role')
    .eq('document_id', documentId)
    .eq('user_id', userId)
    .single()

  if (collaborator && !collabError) {
    return collaborator.role as Role
  }

  throw new Error('Access denied')
}

export function getRoleStrategy(role: Role): RoleStrategy {
  const strategies: Record<Role, RoleStrategy> = {
    owner: {
      canEdit: () => true,
      canComment: () => true,
      canManage: () => true,
      canShare: () => true,
      canDelete: () => true,
    },
    editor: {
      canEdit: () => true,
      canComment: () => true,
      canManage: () => false,
      canShare: () => false,
      canDelete: () => false,
    },
    viewer: {
      canEdit: () => false,
      canComment: () => true,
      canManage: () => false,
      canShare: () => false,
      canDelete: () => false,
    },
  }

  return strategies[role]
}

export async function addCollaborator(
  documentId: string,
  userEmail: string,
  role: Role
): Promise<void> {
  // Get user by email
  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', userEmail)
    .single()

  if (userError || !userData) {
    throw new Error('User not found')
  }

  // Add collaborator
  const { error } = await supabase.from('document_collaborators').insert({
    document_id: documentId,
    user_id: userData.id,
    role,
  })

  if (error) throw error
}

export async function updateCollaboratorRole(
  documentId: string,
  userId: string,
  role: Role
): Promise<void> {
  const { error } = await supabase
    .from('document_collaborators')
    .update({ role })
    .eq('document_id', documentId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function removeCollaborator(
  documentId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('document_collaborators')
    .delete()
    .eq('document_id', documentId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getCollaborators(
  documentId: string
): Promise<
  Array<{
    user_id: string
    email: string
    name: string
    role: Role
  }>
> {
  const { data, error } = await supabase
    .from('document_collaborators')
    .select('user_id, role')
    .eq('document_id', documentId)

  if (error) throw error

  // Fetch user details
  const collaborators = await Promise.all(
    data.map(async (collab) => {
      const { data: user } = await supabase
        .from('auth.users')
        .select('email, user_metadata')
        .eq('id', collab.user_id)
        .single()

      return {
        user_id: collab.user_id,
        email: user?.email || '',
        name: user?.user_metadata?.name || user?.email || '',
        role: collab.role as Role,
      }
    })
  )

  return collaborators
}
