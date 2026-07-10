/* ------------------------------------------------------------------ */
/*  Harvests service — CRUD de safras                                 */
/*  Toda comunicação com /api/v1/harvests/*                            */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Harvest } from "./types"

const HARVESTS_PATH = "/api/v1/harvests"

export const HarvestsService = {
  async list(): Promise<Harvest[]> {
    return apiGet<Harvest[]>(HARVESTS_PATH)
  },

  async get(id: string): Promise<Harvest> {
    return apiGet<Harvest>(`${HARVESTS_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<Harvest> {
    return apiPost<Harvest>(HARVESTS_PATH, { harvest: data })
  },

  async update(id: string, data: Partial<{ name: string }>): Promise<Harvest> {
    return apiPatch<Harvest>(`${HARVESTS_PATH}/${id}`, { harvest: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${HARVESTS_PATH}/${id}`)
  },

  async search(name: string): Promise<Harvest[]> {
    return apiGet<Harvest[]>(HARVESTS_PATH, { name })
  },
}
