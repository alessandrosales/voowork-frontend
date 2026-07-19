/* ------------------------------------------------------------------ */
/*  Users service — CRUD de usuários                                  */
/*  Toda comunicação com /api/v1/users/*                               */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type {
  User,
  UserProfile,
  ProjectMember,
  PaginatedResponse,
} from "./types"

const USERS_PATH = "/api/v1/users"

export const UsersService = {
  async list(
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<User>> {
    return apiGet<PaginatedResponse<User>>(USERS_PATH, params)
  },

  /** Retorna todos os usuários sem paginação — para selects/dropdowns */
  async listAll(): Promise<User[]> {
    const res = await apiGet<{ data: User[] }>(USERS_PATH, {
      paginate: "false",
    })
    return res.data
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

  async listManagedUsers(
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<User>> {
    return apiGet<PaginatedResponse<User>>(
      `${USERS_PATH}/${userId}/managed_users`,
      params,
    )
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

  async listProjectMemberships(
    userId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<ProjectMember>> {
    return apiGet<PaginatedResponse<ProjectMember>>(
      `${USERS_PATH}/${userId}/project_memberships`,
      params,
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
