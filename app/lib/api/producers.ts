/* ------------------------------------------------------------------ */
/*  Producers service — CRUD de produtores                            */
/*  Toda comunicação com /api/v1/producers/*                           */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Producer } from "./types"

const PRODUCERS_PATH = "/api/v1/producers"

export const ProducersService = {
  async list(): Promise<Producer[]> {
    return apiGet<Producer[]>(PRODUCERS_PATH)
  },

  async get(id: string): Promise<Producer> {
    return apiGet<Producer>(`${PRODUCERS_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<Producer> {
    return apiPost<Producer>(PRODUCERS_PATH, { producer: data })
  },

  async update(id: string, data: Partial<{ name: string }>): Promise<Producer> {
    return apiPatch<Producer>(`${PRODUCERS_PATH}/${id}`, { producer: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${PRODUCERS_PATH}/${id}`)
  },

  async search(name: string): Promise<Producer[]> {
    return apiGet<Producer[]>(PRODUCERS_PATH, { name })
  },
}
