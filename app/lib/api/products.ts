/* ------------------------------------------------------------------ */
/*  Products service — CRUD de produtos agrícolas                     */
/*  Toda comunicação com /api/v1/products/*                            */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Product } from "./types"

const PRODUCTS_PATH = "/api/v1/products"

export const ProductsService = {
  async list(): Promise<Product[]> {
    return apiGet<Product[]>(PRODUCTS_PATH)
  },

  async get(id: string): Promise<Product> {
    return apiGet<Product>(`${PRODUCTS_PATH}/${id}`)
  },

  async create(data: { name: string }): Promise<Product> {
    return apiPost<Product>(PRODUCTS_PATH, { product: data })
  },

  async update(id: string, data: Partial<{ name: string }>): Promise<Product> {
    return apiPatch<Product>(`${PRODUCTS_PATH}/${id}`, { product: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${PRODUCTS_PATH}/${id}`)
  },

  async search(name: string): Promise<Product[]> {
    return apiGet<Product[]>(PRODUCTS_PATH, { name })
  },
}
