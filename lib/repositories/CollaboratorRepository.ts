import { supabase } from '@/lib/supabase'
import type { Role } from '@/lib/rbac'

export type Collaborator = {
  user_id: string
  role: Role
}

export class CollaboratorRepository {
  // PATTERN: Repository — centralizes collaborator DB access behind a class.
  // This ensures no component or route imports Supabase directly for collaborator state.

  static async getUserRole(documentId: string, userId: string): Promise<Role> {
    const { data: ownerData, error: ownerError } = await supabase
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single()

    if (ownerError) {
      throw ownerError
    }

    if (ownerData?.owner_id === userId) {
      return 'owner'
    }

    const { data, error } = await supabase
      .from('document_collaborators')
      .select('role')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new Error('Access denied')
    }

    return data.role as Role
  }

  static async getCollaborators(documentId: string): Promise<Array<Collaborator & { email: string; name: string }>> {
    const { data, error } = await supabase
      .from('document_collaborators')
      .select('user_id, role')
      .eq('document_id', documentId)

    if (error) throw error

    const collaborators = await Promise.all(
      data.map(async (collab: { user_id: string; role: Role }) => {
        const { data: user, error: userError } = await supabase
          .from('auth.users')
          .select('email, user_metadata')
          .eq('id', collab.user_id)
          .single()

        if (userError) {
          throw userError
        }

        return {
          user_id: collab.user_id,
          role: collab.role,
          email: user?.email || '',
          name: user?.user_metadata?.name || user?.email || '',
        }
      })
    )

    return collaborators
  }

  static async addCollaborator(
    documentId: string,
    userId: string,
    role: Role
  ): Promise<void> {
    const { error } = await supabase.from('document_collaborators').insert({
      document_id: documentId,
      user_id: userId,
      role,
    })

    if (error) throw error
  }

  static async updateCollaboratorRole(
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

  static async removeCollaborator(documentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('document_collaborators')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', userId)

    if (error) throw error
  }

  static async getUserByEmail(email: string): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()

    if (error || !data) {
      throw new Error('User not found')
    }

    return { id: data.id }
  }
}
