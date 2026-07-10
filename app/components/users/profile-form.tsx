"use client"

import { useState } from "react"
import { useNavigate } from "react-router"

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
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { toast } from "sonner"

import { useAuth } from "~/hooks/use-auth"
import { AuthService, ApiError } from "~/lib/api"

const LANGUAGE_OPTIONS = [
  { value: "pt_br", label: "Português (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
] as const

export function ProfileForm() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [preferredLanguage, setPreferredLanguage] = useState(
    user?.preferred_language ?? "pt_br",
  )
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password && password !== passwordConfirmation) {
      setError("As senhas não conferem.")
      return
    }

    setIsSubmitting(true)

    try {
      await AuthService.updateProfile({
        name,
        email,
        phone: phone || undefined,
        preferred_language: preferredLanguage,
        ...(password
          ? {
              password,
              password_confirmation: passwordConfirmation,
            }
          : {}),
      })

      await refreshUser()
      toast.success("Dados atualizados com sucesso.")
      navigate("/")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.values(err.errors).flat()
          setError(msgs.join(". "))
        } else {
          setError(err.message || "Erro ao atualizar dados.")
        }
      } else {
        setError("Erro de conexão. Verifique o servidor.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Meus Dados</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e preferências.
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
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+5511999999999"
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="language">Idioma</FieldLabel>
                <Select
                  value={preferredLanguage}
                  onValueChange={(val) =>
                    setPreferredLanguage(val as "pt_br" | "en" | "es")
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">
                  Nova senha (deixe em branco para manter)
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha"
                  disabled={isSubmitting}
                />
              </Field>

              {password && (
                <Field>
                  <FieldLabel htmlFor="password-confirmation">
                    Confirmar Senha
                  </FieldLabel>
                  <Input
                    id="password-confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Repita a senha"
                    disabled={isSubmitting}
                  />
                </Field>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
