/* ------------------------------------------------------------------ */
/*  Plans service — listar planos (público) + CRUD admin              */
/*  GET /api/v1/plans                                                  */
/*  POST /api/v1/plans               (admin-only)                      */
/*  PATCH /api/v1/plans/:slug         (admin-only)                      */
/*  DELETE /api/v1/plans/:slug        (admin-only)                      */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Plan } from "./types"

const PLANS_PATH = "/api/v1/plans"

export const PlansService = {
  // ── Público ──────────────────────────────────────────────

  async list(params?: {
    currency?: string
    interval?: "month" | "year"
  }): Promise<Plan[]> {
    return apiGet<Plan[]>(PLANS_PATH, params)
  },

  async get(slug: string): Promise<Plan> {
    return apiGet<Plan>(`${PLANS_PATH}/${slug}`)
  },

  // ── Admin-only ───────────────────────────────────────────

  /** Cria um novo plano (admin) */
  async create(data: {
    plan: {
      slug: string
      name: string
      description?: string
      features?: Record<string, unknown>
      sort_order: number
      active?: boolean
      trial_days?: number
      stripe_product_id?: string
    }
  }): Promise<Plan> {
    return apiPost<Plan>(PLANS_PATH, data)
  },

  /** Atualiza um plano existente (admin) */
  async update(
    slug: string,
    data: {
      plan: Partial<{
        name: string
        description: string
        features: Record<string, unknown>
        sort_order: number
        active: boolean
        trial_days: number
        stripe_product_id: string
      }>
    },
  ): Promise<Plan> {
    return apiPatch<Plan>(`${PLANS_PATH}/${slug}`, data)
  },

  /** Remove um plano (admin). Falha se houver assinaturas vinculadas. */
  async destroy(slug: string): Promise<void> {
    return apiDelete(`${PLANS_PATH}/${slug}`)
  },
}
