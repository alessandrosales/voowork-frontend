/* ------------------------------------------------------------------ */
/*  Users service — CRUD de usuários                                  */
/*  Toda comunicação com /api/v1/users/*                               */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { User } from "./types"

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
  }): Promise<User> {
    return apiPost<User>(USERS_PATH, { user: data })
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      email: string
      phone: string
      password: string
      password_confirmation: string
    }>,
  ): Promise<User> {
    return apiPatch<User>(`${USERS_PATH}/${id}`, { user: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${USERS_PATH}/${id}`)
  },
}
