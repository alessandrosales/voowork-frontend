/* ------------------------------------------------------------------ */
/*  Projects service — CRUD de projetos                               */
/*  Toda comunicação com /api/v1/projects/*                            */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, apiPatch, apiDelete } from "./client"
import type { Project, ProjectMember, ProjectCustomer, Customer } from "./types"

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

  // --- Members (usuários já cadastrados) ---

  async listMembers(projectId: string): Promise<ProjectMember[]> {
    return apiGet<ProjectMember[]>(
      `${PROJECTS_PATH}/${projectId}/members`,
    )
  },

  async addMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember> {
    return apiPost<ProjectMember>(
      `${PROJECTS_PATH}/${projectId}/members`,
      { member: { user_id: userId } },
    )
  },

  async updateMemberRole(
    projectId: string,
    memberId: string,
    role: string,
  ): Promise<ProjectMember> {
    return apiPatch<ProjectMember>(
      `${PROJECTS_PATH}/${projectId}/members/${memberId}`,
      { member: { role } },
    )
  },

  // --- Project Customers ---

  async listProjectCustomers(projectId: string): Promise<ProjectCustomer[]> {
    return apiGet<ProjectCustomer[]>(
      `${PROJECTS_PATH}/${projectId}/customers`,
    )
  },

  async updateProjectCustomerRole(
    projectId: string,
    projectCustomerId: string,
    role: string,
  ): Promise<ProjectCustomer> {
    return apiPatch<ProjectCustomer>(
      `${PROJECTS_PATH}/${projectId}/customers/${projectCustomerId}`,
      { project_customer: { role } },
    )
  },

  /**
   * Invite a client to a project.
   *
   * Two-step flow:
   * 1. Create a Customer via POST /api/v1/customers (status: "invited")
   * 2. Associate the Customer with the project via POST /api/v1/projects/:id/customers
   */
  async inviteClient(
    projectId: string,
    data: { name: string; email: string },
  ): Promise<{ customer: Customer; project_customer: ProjectCustomer }> {
    // Step 1: create the customer with "invited" status
    const customer = await apiPost<Customer>("/api/v1/customers", {
      customer: { name: data.name, email: data.email, status: "invited" },
    })

    // Step 2: associate with project
    const projectCustomer = await apiPost<ProjectCustomer>(
      `${PROJECTS_PATH}/${projectId}/customers`,
      { project_customer: { customer_id: customer.id } },
    )

    return { customer, project_customer: projectCustomer }
  },
}
