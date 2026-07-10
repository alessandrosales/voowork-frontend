/* ------------------------------------------------------------------ */
/*  AuthProvider + useAuth hook                                        */
/*                                                                     */
/*  Gerencia:                                                          */
/*    - Estado do usuário logado                                       */
/*    - Token JWT em localStorage                                      */
/*    - Validação do token existente no mount                          */
/*    - Exposição de login / register / logout                         */
/* ------------------------------------------------------------------ */

"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { AuthService } from "~/lib/api"
import { getToken, setToken } from "~/lib/api/client"
import type { User, RegisterRequest } from "~/lib/api/types"

/* ---------- Types ---------- */

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

/* ---------- Context ---------- */

const AuthContext = createContext<AuthState | undefined>(undefined)

/* ---------- Provider ---------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Tenta restaurar sessão ao montar o provider
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    AuthService.me()
      .then((u) => setUser(u))
      .catch(() => {
        // Token inválido/expirado → limpa
        setToken(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthService.login(email, password)
    setUser(res.user)
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await AuthService.register(data)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    AuthService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ---------- Hook ---------- */

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
