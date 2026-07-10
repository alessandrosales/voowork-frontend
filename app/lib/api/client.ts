/* ------------------------------------------------------------------ */
/*  HTTP client base — toda comunicação com a API passa por aqui      */
/*                                                                     */
/*  - Lê VITE_API_URL do ambiente (Vite expõe variáveis VITE_*)       */
/*  - Injeta token JWT automaticamente quando disponível               */
/*  - Parse uniforme de erros (ApiError)                               */
/*  - Suporte a Content-Type JSON e responses 204                     */
/* ------------------------------------------------------------------ */

import type { ApiErrorBody } from "./types"

/* ---------- Error class ---------- */

export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string[]> | undefined

  constructor(status: number, body?: ApiErrorBody) {
    const messages = body?.errors
      ? Object.values(body.errors).flat()
      : [`Request failed with status ${status}`]

    super(messages.join("; "))
    this.name = "ApiError"
    this.status = status
    this.errors = body?.errors
  }
}

/* ---------- Token management ---------- */

const TOKEN_KEY = "agrojg-auth-token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/* ---------- Helpers ---------- */

function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ""
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = getBaseUrl()
  // path starts with /, e.g. /api/v1/auth/login
  const url = new URL(`${base}${path}`, window.location.origin)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  return url.toString()
}

/* ---------- Public request (no auth) ---------- */

export async function apiPost<T>(
  path: string,
  body: unknown,
  params?: Record<string, string>,
): Promise<T> {
  return request<T>("POST", path, { body, params })
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  return request<T>("GET", path, { params })
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return request<T>("PATCH", path, { body })
}

export async function apiDelete<T = void>(
  path: string,
): Promise<T> {
  return request<T>("DELETE", path)
}

/* ---------- Core request ---------- */

interface RequestOptions {
  body?: unknown
  params?: Record<string, string>
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = buildUrl(path, options.params)

  const response = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json().catch(() => undefined)

  if (!response.ok) {
    throw new ApiError(response.status, json as ApiErrorBody | undefined)
  }

  return json as T
}
