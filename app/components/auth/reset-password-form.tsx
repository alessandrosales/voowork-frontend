"use client"

import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useAuth } from "~/hooks/use-auth"
import { AuthService, ApiError } from "~/lib/api"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get("reset_token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!resetToken) {
      setError("Link inválido ou expirado. Solicite uma nova redefinição de senha.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.")
      return
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      return
    }

    setIsSubmitting(true)

    try {
      await AuthService.changePassword(resetToken, password, confirmPassword)
      await refreshUser()
      navigate("/")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) {
          const messages = Object.values(err.errors).flat()
          setError(messages.join(". "))
        } else {
          setError(err.message || "Erro ao redefinir senha. Tente novamente.")
        }
      } else {
        setError("Erro de conexão. Verifique se o servidor está rodando.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se não há token na URL, mostra estado de erro
  if (!resetToken) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Link inválido</CardTitle>
            <CardDescription>
              O link que você usou é inválido ou expirou. Solicite uma nova
              redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldDescription className="text-center">
              <Link
                to="/forgot-password"
                className="underline-offset-4 hover:underline"
              >
                Solicitar nova redefinição
              </Link>
            </FieldDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Redefinir senha</CardTitle>
          <CardDescription>
            Digite sua nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="password">Nova Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirmar Nova Senha
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  Deve ter pelo menos 8 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
                </Button>
                <FieldDescription className="text-center">
                  <Link to="/login" className="underline-offset-4 hover:underline">
                    Voltar para o login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
