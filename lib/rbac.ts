// PATTERN: Strategy — encapsulates role permissions behind swappable strategy classes.
// This lets RBAC evolve without changing document or UI logic.
// CLOUD PATTERN: Zero-Trust Access Control.
// Every operation verifies permissions explicitly and uses DB-backed role resolution.

import {
  CollaboratorRepository,
  type Collaborator,
} from '@/lib/repositories/CollaboratorRepository'

export type Role = 'owner' | 'editor' | 'viewer'

export interface RoleStrategy {
  canEdit: () => boolean
  canComment: () => boolean
  canManage: () => boolean
  canShare: () => boolean
  canDelete: () => boolean
}

abstract class BaseRoleStrategy implements RoleStrategy {
  abstract canEdit(): boolean
  abstract canComment(): boolean
  abstract canManage(): boolean
  abstract canShare(): boolean
  abstract canDelete(): boolean
}

class OwnerStrategy extends BaseRoleStrategy {
  canEdit() { return true }
  canComment() { return true }
  canManage() { return true }
  canShare() { return true }
  canDelete() { return true }
}

class EditorStrategy extends BaseRoleStrategy {
  canEdit() { return true }
  canComment() { return true }
  canManage() { return false }
  canShare() { return false }
  canDelete() { return false }
}

class ViewerStrategy extends BaseRoleStrategy {
  canEdit() { return false }
  canComment() { return true }
  canManage() { return false }
  canShare() { return false }
  canDelete() { return false }
}

export async function getUserRole(documentId: string, userId: string): Promise<Role> {
  return CollaboratorRepository.getUserRole(documentId, userId)
}

export function getRoleStrategy(role: Role): RoleStrategy {
  switch (role) {
    case 'owner':
      return new OwnerStrategy()
    case 'editor':
      return new EditorStrategy()
    case 'viewer':
      return new ViewerStrategy()
    default:
      return new ViewerStrategy()
  }
}

export async function addCollaborator(
  documentId: string,
  userEmail: string,
  role: Role
): Promise<void> {
  const { id } = await CollaboratorRepository.getUserByEmail(userEmail)
  return CollaboratorRepository.addCollaborator(documentId, id, role)
}

export async function updateCollaboratorRole(
  documentId: string,
  userId: string,
  role: Role
): Promise<void> {
  return CollaboratorRepository.updateCollaboratorRole(documentId, userId, role)
}

export async function removeCollaborator(
  documentId: string,
  userId: string
): Promise<void> {
  return CollaboratorRepository.removeCollaborator(documentId, userId)
}

export async function getCollaborators(documentId: string): Promise<Array<Collaborator & { email: string; name: string }>> {
  return CollaboratorRepository.getCollaborators(documentId)
}
