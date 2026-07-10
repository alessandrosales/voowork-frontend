/* ------------------------------------------------------------------ */
/*  Tipos compartilhados da API V1                                    */
/*  Ref: spec OpenAPI em /api-docs/v1/openapi.json                    */
/* ------------------------------------------------------------------ */

/* ---------- Account ---------- */
export interface Account {
  id: string
  name: string
  email: string
  preferred_language: "en" | "pt-BR" | "es"
  created_at: string
}

/* ---------- User ---------- */
export interface User {
  id: string
  account_id: string
  name: string
  email: string
  phone: string | null
  preferred_language: "en" | "pt-BR" | "es"
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

/* ---------- Common ---------- */
export interface ApiErrorBody {
  errors: Record<string, string[]>
}
