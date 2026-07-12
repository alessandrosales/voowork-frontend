/* ------------------------------------------------------------------ */
/*  Tipos compartilhados da API V1                                    */
/*  Ref: spec OpenAPI em /api-docs/v1/openapi.json                    */
/* ------------------------------------------------------------------ */

/* ---------- Account ---------- */
export interface Account {
  id: string
  name: string
  email: string
  preferred_language: "en" | "pt_br" | "es"
  created_at: string
}

/* ---------- User ---------- */
export interface User {
  id: string
  account_id: string
  name: string
  email: string
  phone: string | null
  preferred_language: "en" | "pt_br" | "es"
  projects: ProjectRef[]
  created_at: string
  updated_at: string
}

/* ---------- Customer ---------- */
export interface Customer {
  id: string
  account_id: string
  email: string
  name: string
  phone: string | null
  status: "invited" | "active" | "inactive"
  invited_at: string | null
  projects: ProjectRef[]
  created_at: string
  updated_at: string
}

/* ---------- Agent ---------- */
export interface Agent {
  id: string
  name: string
  system_prompt: string
  rules: string | null
  model: string
  created_at: string
  updated_at: string
}

/* ---------- Conversation ---------- */
export interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string | null
  metadata: Record<string, unknown> | null
  position: number
  created_at: string
}

export interface Conversation {
  id: string
  agent_id: string
  title: string | null
  status: "active" | "archived"
  message_count: number
  last_message: Message | null
  created_at: string
  updated_at: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

/* ---------- Auth ---------- */
export interface LoginRequest {
  auth: {
    email: string
    password: string
  }
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  account: {
    name: string
    email: string
    preferred_language?: string
  }
  user: {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
  }
}

export interface RegisterResponse {
  token: string
  user: User
  account: Account
}

/* ---------- Password Recovery ---------- */
export interface RecoverPasswordRequest {
  auth: {
    email: string
  }
}

export interface ChangePasswordRequest {
  auth: {
    reset_token: string
    password: string
    password_confirmation: string
  }
}

export interface ChangePasswordResponse {
  token: string
  user: User
}

/* ---------- Producer ---------- */
export interface Producer {
  id: string
  account_id: string
  name: string
  created_at: string
  updated_at: string
}

/* ---------- Farm ---------- */
export interface Farm {
  id: string
  account_id: string
  name: string
  created_at: string
  updated_at: string
}

/* ---------- Harvest ---------- */
export interface Harvest {
  id: string
  account_id: string
  name: string
  created_at: string
  updated_at: string
}

/* ---------- Unit ---------- */
export interface Unit {
  id: string
  account_id: string
  name: string
  created_at: string
  updated_at: string
}

/* ---------- Product ---------- */
export interface Product {
  id: string
  account_id: string
  name: string
  created_at: string
  updated_at: string
}

/* ---------- Company ---------- */
export interface Company {
  id: string
  account_id: string
  name: string
  producer: boolean
  supplier: boolean
  created_at: string
  updated_at: string
}

/* ---------- Project Member ---------- */
export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: "owner" | "editor" | "viewer"
  created_at: string
  updated_at: string
}

/* ---------- Project ---------- */
export interface Project {
  id: string
  account_id: string
  name: string
  featured: boolean
  tasks_count: number
  created_at: string
  updated_at: string
}

/* ---------- Project Customer (join table) ---------- */
export interface ProjectCustomer {
  id: string
  customer_id: string
  project_id: string
  role: "editor" | "viewer"
  created_at: string
  updated_at: string
}

/* ---------- Task ---------- */
export interface Task {
  id: string
  account_id: string
  project_id: string
  name: string
  description: string | null
  position: number
  created_at: string
  updated_at: string
}

/* ---------- Pagination ---------- */
export interface PaginationMeta {
  page: number
  per_page: number
  total_count: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/* ---------- Project reference (embedded in User/Customer) ---------- */
export interface ProjectRef {
  id: string
  name: string
}

/* ---------- Common ---------- */
export interface ApiErrorBody {
  errors: Record<string, string[]>
}
