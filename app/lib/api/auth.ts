/* ------------------------------------------------------------------ */
/*  Auth service — login, register, me, logout                        */
/*  Toda comunicação com /api/v1/auth/*                                */
/* ------------------------------------------------------------------ */

import { apiGet, apiPatch, apiPost, setToken } from "./client"
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  RecoverPasswordRequest,
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
   * Atualiza perfil do usuário autenticado (PATCH /auth/me).
   */
  async updateProfile(
    data: Partial<{
      name: string
      email: string
      phone: string
      preferred_language: User["preferred_language"]
      password: string
      password_confirmation: string
    }>,
  ): Promise<User> {
    return apiPatch<User>(`${AUTH_PREFIX}/me`, { user: data })
  },

  /**
   * Solicita redefinição de senha (POST /auth/recover-password).
   * Envia email com link contendo o reset_token.
   * Retorna 204 sempre (mesmo se email não existir), então o tipo é void.
   */
  async recoverPassword(email: string): Promise<void> {
    const body: RecoverPasswordRequest = { auth: { email } }
    await apiPost<void>(`${AUTH_PREFIX}/recover-password`, body)
  },

  /**
   * Redefine a senha com o token recebido por email (POST /auth/change-password).
   * Em caso de sucesso retorna um novo JWT + dados do usuário.
   */
  async changePassword(
    reset_token: string,
    password: string,
    password_confirmation: string,
  ): Promise<ChangePasswordResponse> {
    const body: ChangePasswordRequest = {
      auth: { reset_token, password, password_confirmation },
    }
    const res = await apiPost<ChangePasswordResponse>(
      `${AUTH_PREFIX}/change-password`,
      body,
    )
    // A nova senha gera um novo JWT — persiste automaticamente
    setToken(res.token)
    return res
  },

  /**
   * Remove o token armazenado (logout local).
   * O backend não invalida o JWT — a expiration de 24h é o limite real.
   */
  logout(): void {
    setToken(null)
  },
}
