/* ------------------------------------------------------------------ */
/*  InvoiceTypes service — CRUD de tipos de nota fiscal               */
/*                                                                     */
/*  Nomeado "invoice_type" no frontend para evitar conflito com        */
/*  o arquivo types.ts. A API Rails responde em /api/v1/types/*.       */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { InvoiceType } from "./types"

// A API Rails expõe o endpoint como /api/v1/types
const INVOICE_TYPES_PATH = "/api/v1/types"

export const InvoiceTypesService = {
  async list(): Promise<InvoiceType[]> {
    return apiGet<InvoiceType[]>(INVOICE_TYPES_PATH)
  },

  async get(id: string): Promise<InvoiceType> {
    return apiGet<InvoiceType>(`${INVOICE_TYPES_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<InvoiceType> {
    return apiPost<InvoiceType>(INVOICE_TYPES_PATH, { type: data })
  },

  async update(
    id: string,
    data: Partial<{ name: string }>,
  ): Promise<InvoiceType> {
    return apiPatch<InvoiceType>(`${INVOICE_TYPES_PATH}/${id}`, { type: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${INVOICE_TYPES_PATH}/${id}`)
  },

  async search(name: string): Promise<InvoiceType[]> {
    return apiGet<InvoiceType[]>(INVOICE_TYPES_PATH, { name })
  },
}
