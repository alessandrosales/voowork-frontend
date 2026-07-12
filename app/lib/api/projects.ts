/* ------------------------------------------------------------------ */
/*  Projects service — CRUD de projetos                               */
/*  Toda comunicação com /api/v1/projects/*                            */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Project } from "./types"

const PROJECTS_PATH = "/api/v1/projects"

export const ProjectsService = {
  async list(): Promise<Project[]> {
    return apiGet<Project[]>(PROJECTS_PATH)
  },

  async get(id: string): Promise<Project> {
    return apiGet<Project>(`${PROJECTS_PATH}/${id}`)
  },

  async create(data: { name: string; featured?: boolean }): Promise<Project> {
    return apiPost<Project>(PROJECTS_PATH, { project: data })
  },

  async update(
    id: string,
    data: Partial<{ name: string; featured: boolean }>,
  ): Promise<Project> {
    return apiPatch<Project>(`${PROJECTS_PATH}/${id}`, { project: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${PROJECTS_PATH}/${id}`)
  },
}
