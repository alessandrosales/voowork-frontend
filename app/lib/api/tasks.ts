/* ------------------------------------------------------------------ */
/*  Tasks service — CRUD de tarefas                                   */
/*                                                                     */
/*  A API Rails expõe dois patterns:                                  */
/*    GET/POST  /api/v1/projects/:project_id/tasks                     */
/*    GET/PATCH/DELETE  /api/v1/tasks/:id                              */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Task } from "./types"

const TASKS_PATH = "/api/v1/tasks"

export const TasksService = {
  async listByProject(projectId: string): Promise<Task[]> {
    return apiGet<Task[]>(`/api/v1/projects/${projectId}/tasks`)
  },

  async create(
    projectId: string,
    data: { name: string; description?: string; position?: number },
  ): Promise<Task> {
    return apiPost<Task>(`/api/v1/projects/${projectId}/tasks`, {
      task: { ...data, project_id: projectId },
    })
  },

  async get(id: string): Promise<Task> {
    return apiGet<Task>(`${TASKS_PATH}/${id}`)
  },

  async update(
    id: string,
    data: Partial<{ name: string; description: string | null; position: number }>,
  ): Promise<Task> {
    return apiPatch<Task>(`${TASKS_PATH}/${id}`, { task: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${TASKS_PATH}/${id}`)
  },
}
