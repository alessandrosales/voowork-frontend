/* ------------------------------------------------------------------ */
/*  Units service — CRUD de unidades de medida                        */
/*  Toda comunicação com /api/v1/units/*                               */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Unit } from "./types"

const UNITS_PATH = "/api/v1/units"

export const UnitsService = {
  async list(): Promise<Unit[]> {
    return apiGet<Unit[]>(UNITS_PATH)
  },

  async get(id: string): Promise<Unit> {
    return apiGet<Unit>(`${UNITS_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<Unit> {
    return apiPost<Unit>(UNITS_PATH, { unit: data })
  },

  async update(id: string, data: Partial<{ name: string }>): Promise<Unit> {
    return apiPatch<Unit>(`${UNITS_PATH}/${id}`, { unit: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${UNITS_PATH}/${id}`)
  },

  async search(name: string): Promise<Unit[]> {
    return apiGet<Unit[]>(UNITS_PATH, { name })
  },
}
