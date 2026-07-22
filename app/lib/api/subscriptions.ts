/* ------------------------------------------------------------------ */
/*  Subscription service — gerenciar assinatura do account             */
/*  GET/POST/PATCH/DELETE /api/v1/subscription                         */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type {
  Subscription,
  CreateCheckoutResponse,
  UpdateSubscriptionResponse,
} from "./types"

const SUBSCRIPTION_PATH = "/api/v1/subscription"

export const SubscriptionsService = {
  /** Retorna a assinatura ativa do account */
  async get(): Promise<{ subscription: Subscription | null }> {
    return apiGet<{ subscription: Subscription | null }>(SUBSCRIPTION_PATH)
  },

  /** Cria uma checkout session no Stripe e retorna a URL */
  async createCheckout(data: {
    plan_price_id: string
    success_url: string
    cancel_url: string
  }): Promise<CreateCheckoutResponse> {
    return apiPost<CreateCheckoutResponse>(SUBSCRIPTION_PATH, data)
  },

  /** Faz upgrade/downgrade do plano */
  async update(
    data: { plan_price_id: string },
  ): Promise<UpdateSubscriptionResponse> {
    return apiPatch<UpdateSubscriptionResponse>(SUBSCRIPTION_PATH, data)
  },

  /** Cancela a assinatura */
  async cancel(): Promise<void> {
    return apiDelete(SUBSCRIPTION_PATH)
  },
}
