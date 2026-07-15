/* ------------------------------------------------------------------ */
/*  Users service — CRUD de usuários                                  */
/*  Toda comunicação com /api/v1/users/*                               */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { User, UserProfile, ProjectMember } from "./types"

const USERS_PATH = "/api/v1/users"

export const UsersService = {
  async list(): Promise<User[]> {
    return apiGet<User[]>(USERS_PATH)
  },

  async get(id: string): Promise<User> {
    return apiGet<User>(`${USERS_PATH}/${id}`)
  },

  async create(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
    profile?: UserProfile
  }): Promise<User> {
    return apiPost<User>(USERS_PATH, { user: data })
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      email: string
      phone: string
      profile: UserProfile
      password: string
      password_confirmation: string
    }>,
  ): Promise<User> {
    return apiPatch<User>(`${USERS_PATH}/${id}`, { user: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${USERS_PATH}/${id}`)
  },

  // --- Managed users (gestor → usuários gerenciados) ---

  async listManagedUsers(userId: string): Promise<User[]> {
    return apiGet<User[]>(`${USERS_PATH}/${userId}/managed_users`)
  },

  async addManagedUser(userId: string, managedUserId: string): Promise<User> {
    return apiPost<User>(`${USERS_PATH}/${userId}/managed_users`, {
      managed_user: { managed_user_id: managedUserId },
    })
  },

  async removeManagedUser(userId: string, managedUserId: string): Promise<void> {
    return apiDelete(`${USERS_PATH}/${userId}/managed_users/${managedUserId}`)
  },

  // --- Project memberships (comum → projetos) ---

  async listProjectMemberships(userId: string): Promise<ProjectMember[]> {
    return apiGet<ProjectMember[]>(
      `${USERS_PATH}/${userId}/project_memberships`,
    )
  },

  async addProjectMembership(
    userId: string,
    projectId: string,
    role?: string,
  ): Promise<ProjectMember> {
    return apiPost<ProjectMember>(
      `${USERS_PATH}/${userId}/project_memberships`,
      { project_membership: { project_id: projectId, role } },
    )
  },

  async removeProjectMembership(
    userId: string,
    projectId: string,
  ): Promise<void> {
    return apiDelete(
      `${USERS_PATH}/${userId}/project_memberships/${projectId}`,
    )
  },
}
