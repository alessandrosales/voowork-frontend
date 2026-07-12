import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Customer } from "./types"

const CUSTOMERS_PATH = "/api/v1/customers"

export const CustomersService = {
  async list(params?: { name?: string; status?: string }): Promise<Customer[]> {
    return apiGet<Customer[]>(CUSTOMERS_PATH, params as Record<string, string>)
  },

  async get(id: string): Promise<Customer> {
    return apiGet<Customer>(`${CUSTOMERS_PATH}/${id}`)
  },

  async create(data: {
    name: string
    email: string
    phone?: string
    password?: string
    password_confirmation?: string
    status?: string
  }): Promise<Customer> {
    return apiPost<Customer>(CUSTOMERS_PATH, { customer: data })
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      email: string
      phone: string
      password: string
      password_confirmation: string
      status: string
    }>,
  ): Promise<Customer> {
    return apiPatch<Customer>(`${CUSTOMERS_PATH}/${id}`, { customer: data })
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`${CUSTOMERS_PATH}/${id}`)
  },
}
