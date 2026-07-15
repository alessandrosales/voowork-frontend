import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Customer, CustomerUserRef } from "./types"

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

  // --- Customer Users ---

  async listUsers(customerId: string): Promise<CustomerUserRef[]> {
    return apiGet<CustomerUserRef[]>(`${CUSTOMERS_PATH}/${customerId}/users`)
  },

  async addUser(customerId: string, userId: string): Promise<CustomerUserRef> {
    return apiPost<CustomerUserRef>(`${CUSTOMERS_PATH}/${customerId}/users`, {
      customer_user: { user_id: userId },
    })
  },

  async removeUser(customerId: string, userId: string): Promise<void> {
    return apiDelete(`${CUSTOMERS_PATH}/${customerId}/users/${userId}`)
  },

  // --- Customer Projects ---

  async listProjects(customerId: string): Promise<ProjectRef[]> {
    return apiGet<ProjectRef[]>(`${CUSTOMERS_PATH}/${customerId}/projects`)
  },

  async addProject(customerId: string, projectId: string): Promise<ProjectRef> {
    return apiPost<ProjectRef>(`${CUSTOMERS_PATH}/${customerId}/projects`, {
      customer_project: { project_id: projectId },
    })
  },

  async removeProject(customerId: string, projectId: string): Promise<void> {
    return apiDelete(`${CUSTOMERS_PATH}/${customerId}/projects/${projectId}`)
  },
}

type ProjectRef = { id: string; name: string }
