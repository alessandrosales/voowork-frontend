/* ------------------------------------------------------------------ */
/*  Auth service — login, register, me, logout                        */
/*  Toda comunicação com /api/v1/auth/*                                */
/* ------------------------------------------------------------------ */

import { apiGet, apiPost, setToken } from "./client"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "./types"

const AUTH_PREFIX = "/api/v1/auth"

export const AuthService = {
  /**
   * Login com email + senha.
   * Persiste o token automaticamente.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const body: LoginRequest = { auth: { email, password } }
    const res = await apiPost<LoginResponse>(`${AUTH_PREFIX}/login`, body)
    setToken(res.token)
    return res
  },

  /**
   * Registra nova conta + usuário.
   * Persiste o token automaticamente.
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await apiPost<RegisterResponse>(`${AUTH_PREFIX}/register`, data)
    setToken(res.token)
    return res
  },

  /**
   * Recupera perfil do usuário autenticado (GET /auth/me).
   * Usado para validar token existente ao iniciar a app.
   */
  async me(): Promise<User> {
    return apiGet<User>(`${AUTH_PREFIX}/me`)
  },

  /**
   * Remove o token armazenado (logout local).
   * O backend não invalida o JWT — a expiration de 24h é o limite real.
   */
  logout(): void {
    setToken(null)
  },
}
