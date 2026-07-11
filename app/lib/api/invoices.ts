/* ------------------------------------------------------------------ */
/*  Invoices service — CRUD de notas fiscais                          */
/*  Toda comunicação com /api/v1/invoices/*                            */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Invoice, PaginatedResponse } from "./types"

const INVOICES_PATH = "/api/v1/invoices"

export const InvoicesService = {
  async list(page = 1, perPage = 25, q?: string): Promise<PaginatedResponse<Invoice>> {
    const params: Record<string, string> = {
      page: String(page),
      per_page: String(perPage),
    }
    if (q && q.trim()) params.q = q.trim()
    return apiGet<PaginatedResponse<Invoice>>(INVOICES_PATH, params)
  },

  async get(id: string): Promise<Invoice> {
    return apiGet<Invoice>(`${INVOICES_PATH}/${id}`)
  },

  async create(data: {
    harvest_id: string
    producer_id: string
    farm_id: string
    number: string
    date: string
    supplier_id: string
    product_id: string
    unit_id: string
    quantity: number
    unit_price: number
    total_value: number
    company_id: string
    type_id: string
    origin_invoice_number?: string | null
    delivery?: string
    notes?: string
  }): Promise<Invoice> {
    return apiPost<Invoice>(INVOICES_PATH, { invoice: data })
  },

  async update(
    id: string,
    data: Partial<{
      number: string
      date: string
      quantity: number
      unit_price: number
      total_value: number
      harvest_id: string
      producer_id: string
      farm_id: string
      supplier_id: string
      product_id: string
      unit_id: string
      company_id: string
      type_id: string
      origin_invoice_number: string | null
      delivery: string
      notes: string
    }>,
  ): Promise<Invoice> {
    return apiPatch<Invoice>(`${INVOICES_PATH}/${id}`, { invoice: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${INVOICES_PATH}/${id}`)
  },

  async search(name: string): Promise<Invoice[]> {
    return apiGet<Invoice[]>(INVOICES_PATH, { name })
  },
}
