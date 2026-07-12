"use client"

import { useState } from "react"
import { Link } from "react-router"

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
import { AuthService, ApiError } from "~/lib/api"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await AuthService.recoverPassword(email)
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Erro ao solicitar redefinição. Tente novamente.")
      } else {
        setError("Erro de conexão. Verifique se o servidor está rodando.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Email enviado!</CardTitle>
            <CardDescription>
              Se o email informado estiver cadastrado, você receberá um link
              para redefinir sua senha em instantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-4">
                Não recebeu o email? Verifique sua caixa de spam ou tente
                novamente.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false)
                  setEmail("")
                }}
                className="text-sm underline-offset-4 hover:underline"
              >
                Enviar novamente
              </button>
            </div>
          </CardContent>
        </Card>
      <FieldDescription className="px-6 text-center text-white">
          <Link to="/login" className="underline-offset-4 hover:underline">
            Voltar para o login
          </Link>
        </FieldDescription>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu email e enviaremos um link para redefinir sua senha.
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
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
      <FieldDescription className="px-6 text-center">
        Ao continuar, você concorda com nossos{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Termos de Serviço
        </a>{" "}
        e{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Política de Privacidade
        </a>.
      </FieldDescription>
    </div>
  )
}
