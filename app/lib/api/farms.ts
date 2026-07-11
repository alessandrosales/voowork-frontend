/* ------------------------------------------------------------------ */
/*  Farms service — CRUD de fazendas                                  */
/*  Toda comunicação com /api/v1/farms/*                               */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Farm } from "./types"

const FARMS_PATH = "/api/v1/farms"

export const FarmsService = {
  async list(): Promise<Farm[]> {
    return apiGet<Farm[]>(FARMS_PATH)
  },

  async get(id: string): Promise<Farm> {
    return apiGet<Farm>(`${FARMS_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<Farm> {
    return apiPost<Farm>(FARMS_PATH, { farm: data })
  },

  async update(id: string, data: Partial<{ name: string }>): Promise<Farm> {
    return apiPatch<Farm>(`${FARMS_PATH}/${id}`, { farm: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${FARMS_PATH}/${id}`)
  },

  async search(name: string): Promise<Farm[]> {
    return apiGet<Farm[]>(FARMS_PATH, { name })
  },
}
