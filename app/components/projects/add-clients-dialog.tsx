"use client"

import * as React from "react"
import { toast } from "sonner"
import { UserIcon, UsersIcon, ExternalLinkIcon, PencilIcon, EyeIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { ProjectsService, CustomersService, ApiError } from "~/lib/api"
import type { Customer, ProjectCustomer } from "~/lib/api/types"

interface AddClientsDialogProps {
  projectId: string
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const STATUS_LABELS: Record<string, string> = {
  invited: "Convidado",
  active: "Ativo",
  inactive: "Inativo",
}

const CUSTOMER_ROLE_LABELS: Record<string, string> = {
  editor: "Editor",
  viewer: "Visualizador",
}

const CUSTOMER_ROLE_ICONS: Record<string, typeof PencilIcon> = {
  editor: PencilIcon,
  viewer: EyeIcon,
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  invited: "secondary",
  active: "default",
  inactive: "outline",
}

export function AddClientsDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
  onSuccess,
}: AddClientsDialogProps) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [projectCustomers, setProjectCustomers] = React.useState<
    ProjectCustomer[]
  >([])
  const [loadingCustomers, setLoadingCustomers] = React.useState(true)
  const [customersError, setCustomersError] = React.useState<string | null>(
    null,
  )

  const [allCustomers, setAllCustomers] = React.useState<Customer[]>([])
  const [loadingAll, setLoadingAll] = React.useState(true)

  const [updatingRoles, setUpdatingRoles] = React.useState<Set<string>>(
    new Set(),
  )

  const [customerToDelete, setCustomerToDelete] =
    React.useState<ProjectCustomer | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    try {
      await ProjectsService.deleteProjectCustomer(
        projectId,
        customerToDelete.id,
      )
      toast.success("Cliente removido do projeto.")
      setDeleteConfirmOpen(false)
      setCustomerToDelete(null)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao remover cliente.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRoleChange = async (
    projectCustomerId: string,
    newRole: string,
  ) => {
    setUpdatingRoles((prev) => new Set(prev).add(projectCustomerId))
    try {
      const updated = await ProjectsService.updateProjectCustomerRole(
        projectId,
        projectCustomerId,
        newRole,
      )
      setProjectCustomers((prev) =>
        prev.map((pc) => (pc.id === projectCustomerId ? updated : pc)),
      )
      toast.success("Função atualizada.")
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao atualizar função.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setUpdatingRoles((prev) => {
        const next = new Set(prev)
        next.delete(projectCustomerId)
        return next
      })
    }
  }

  // Build customer lookup map
  const customerMap = React.useMemo(() => {
    const map = new Map<string, Customer>()
    for (const c of allCustomers) map.set(c.id, c)
    return map
  }, [allCustomers])

  // Fetch data when dialog opens
  const fetchData = React.useCallback(() => {
    if (!open) return

    setName("")
    setEmail("")
    setError(null)
    setLoadingCustomers(true)
    setLoadingAll(true)
    setCustomersError(null)

    Promise.all([
      ProjectsService.listProjectCustomers(projectId)
        .then((res) => setProjectCustomers(res.data))
        .catch((err) => {
          if (err instanceof ApiError) {
            setCustomersError(err.message)
          } else {
            setCustomersError("Erro ao carregar clientes do projeto.")
          }
        })
        .finally(() => setLoadingCustomers(false)),
      CustomersService.list()
        .then((res) => setAllCustomers(res.data))
        .catch(() => {
          // Silently fail — secondary data
        })
        .finally(() => setLoadingAll(false)),
    ])
  }, [open, projectId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim()) {
      setError("Preencha todos os campos.")
      return
    }

    setIsSubmitting(true)

    try {
      await ProjectsService.inviteClient(projectId, {
        name: name.trim(),
        email: email.trim(),
      })
      toast.success(`Cliente "${name.trim()}" convidado com sucesso.`)
      setName("")
      setEmail("")
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.values(err.errors).flat()
          setError(msgs.join(". "))
        } else {
          setError(err.message)
        }
      } else {
        setError("Erro de conexão.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = loadingCustomers || loadingAll

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Gerenciar Clientes</DialogTitle>
          <DialogDescription>
            Gerencie os clientes do projeto "{projectName}".
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Existing customers list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UsersIcon className="size-3.5" />
            Clientes no projeto
          </div>

          {loadingCustomers ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : customersError ? (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {customersError}
            </div>
          ) : projectCustomers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum cliente ainda.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {projectCustomers.map((pc) => {
                const customer = customerMap.get(pc.customer_id)

                return (
                  <div
                    key={pc.id}
                    className="flex items-center gap-2 px-2.5 py-1.5"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <UserIcon className="size-3" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
                      <span className="truncate text-xs font-medium">
                        {customer?.name ?? "—"}
                      </span>
                      {customer && (
                        <Badge
                          variant={STATUS_VARIANTS[customer.status] ?? "outline"}
                          className="shrink-0 px-1.5 py-0 text-[0.625rem] leading-none"
                        >
                          {STATUS_LABELS[customer.status] ?? customer.status}
                        </Badge>
                      )}
                    </div>
                    <Select
                      value={pc.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(pc.id, newRole)
                      }
                      disabled={updatingRoles.has(pc.id)}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-6 w-24 gap-1 px-1.5 text-[0.625rem]"
                      >
                        {(() => {
                          const RoleIcon = CUSTOMER_ROLE_ICONS[pc.role] ?? EyeIcon
                          return <RoleIcon className="size-2.5 shrink-0" />
                        })()}
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["editor", "viewer"] as const).map((role) => (
                          <SelectItem key={role} value={role} className="text-xs">
                            {CUSTOMER_ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerToDelete(pc)
                          setDeleteConfirmOpen(true)
                        }}
                        className="ml-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive"
                        title="Remover cliente"
                      >
                        <Trash2Icon className="size-3" />
                      </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Delete confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover cliente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este cliente do projeto? Esta
                ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDeleteCustomer}
                disabled={isDeleting}
              >
                {isDeleting ? "Removendo..." : "Remover"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add new client form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <ExternalLinkIcon className="size-3.5" />
              Convidar
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="client-name" className="text-xs">Nome</FieldLabel>
                <Input
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do cliente"
                  required
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="client-email" className="text-xs">E-mail</FieldLabel>
                <Input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              size="sm"
            >
              Fechar
            </Button>
            <Button type="submit" disabled={isSubmitting || loading} size="sm">
              {isSubmitting ? "Convidando..." : "Convidar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
