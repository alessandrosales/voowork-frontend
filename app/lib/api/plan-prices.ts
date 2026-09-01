/* ------------------------------------------------------------------ */
/*  PlanPrices service — CRUD admin-only                               */
/*  POST   /api/v1/plans/:plan_slug/plan_prices                         */
/*  PATCH  /api/v1/plans/:plan_slug/plan_prices/:id                     */
/*  DELETE /api/v1/plans/:plan_slug/plan_prices/:id                     */
/* ------------------------------------------------------------------ */

import { apiPost, apiPatch, apiDelete } from "./client"
import type { PlanPrice } from "./types"

export const PlanPricesService = {
  /** Cria um novo preço para um plano (admin) */
  async create(planSlug: string, data: {
    plan_price: {
      stripe_price_id: string
      currency: string
      interval: "month" | "year"
      unit_amount_cents: number
      country_code?: string
      active?: boolean
    }
  }): Promise<PlanPrice> {
    return apiPost<PlanPrice>(`/api/v1/plans/${planSlug}/plan_prices`, data)
  },

  /** Atualiza um preço existente (admin) */
  async update(planSlug: string, priceId: string, data: {
    plan_price: Partial<{
      stripe_price_id: string
      currency: string
      interval: "month" | "year"
      unit_amount_cents: number
      country_code: string
      active: boolean
    }>
  }): Promise<PlanPrice> {
    return apiPatch<PlanPrice>(`/api/v1/plans/${planSlug}/plan_prices/${priceId}`, data)
  },

  /** Remove um preço (admin). Falha se houver assinaturas vinculadas. */
  async destroy(planSlug: string, priceId: string): Promise<void> {
    return apiDelete(`/api/v1/plans/${planSlug}/plan_prices/${priceId}`)
  },
}
