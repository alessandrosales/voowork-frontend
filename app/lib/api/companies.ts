/* ------------------------------------------------------------------ */
/*  Companies service — CRUD de empresas                              */
/*  Toda comunicação com /api/v1/companies/*                           */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Company } from "./types"

const COMPANIES_PATH = "/api/v1/companies"

export const CompaniesService = {
  async list(): Promise<Company[]> {
    return apiGet<Company[]>(COMPANIES_PATH)
  },

  async get(id: string): Promise<Company> {
    return apiGet<Company>(`${COMPANIES_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<Company> {
    return apiPost<Company>(COMPANIES_PATH, { company: data })
  },

  async update(id: string, data: Partial<{ name: string }>): Promise<Company> {
    return apiPatch<Company>(`${COMPANIES_PATH}/${id}`, { company: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${COMPANIES_PATH}/${id}`)
  },

  async search(name: string): Promise<Company[]> {
    return apiGet<Company[]>(COMPANIES_PATH, { name })
  },
}
