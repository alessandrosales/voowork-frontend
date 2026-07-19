"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  UserIcon,
  UsersIcon,
  Trash2Icon,
} from "lucide-react"

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { CustomersService, UsersService, ApiError } from "~/lib/api"
import type { Customer, CustomerUserRef } from "~/lib/api/types"

interface ManageCustomerUsersDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ManageCustomerUsersDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: ManageCustomerUsersDialogProps) {
  const [allUsers, setAllUsers] = React.useState<CustomerUserRef[]>([])
  const [loadingAll, setLoadingAll] = React.useState(true)

  const [customerUsers, setCustomerUsers] = React.useState<CustomerUserRef[]>(
    [],
  )
  const [loadingUsers, setLoadingUsers] = React.useState(true)
  const [usersError, setUsersError] = React.useState<string | null>(null)

  const [selectedUser, setSelectedUser] =
    React.useState<CustomerUserRef | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const [removingIds, setRemovingIds] = React.useState<Set<string>>(new Set())

  // Set of user IDs already linked
  const linkedUserIds = React.useMemo(() => {
    return new Set(customerUsers.map((u) => u.id))
  }, [customerUsers])

  // Users not yet linked
  const availableUsers = React.useMemo(() => {
    return allUsers.filter((u) => !linkedUserIds.has(u.id))
  }, [allUsers, linkedUserIds])

  // Fetch data when dialog opens
  const fetchData = React.useCallback(() => {
    if (!open) return

    setLoadingUsers(true)
    setLoadingAll(true)
    setUsersError(null)
    setSubmitError(null)
    setSelectedUser(null)

    Promise.all([
      CustomersService.listUsers(customer.id)
        .then((res) => setCustomerUsers(res.data))
        .catch((err) => {
          if (err instanceof ApiError) {
            setUsersError(err.message)
          } else {
            setUsersError("Erro ao carregar usuários do cliente.")
          }
        })
        .finally(() => setLoadingUsers(false)),
      UsersService.list()
        .then((res) =>
          setAllUsers(res.data.map((u) => ({ id: u.id, name: u.name }))),
        )
        .catch(() => {})
        .finally(() => setLoadingAll(false)),
    ])
  }, [open, customer.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async () => {
    if (!selectedUser) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await CustomersService.addUser(customer.id, selectedUser.id)
      toast.success(
        `Usuário "${selectedUser.name}" vinculado ao cliente.`,
      )
      setSelectedUser(null)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.values(err.errors).flat()
          setSubmitError(msgs.join(". "))
        } else {
          setSubmitError(err.message)
        }
      } else {
        setSubmitError("Erro de conexão.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (user: CustomerUserRef) => {
    setRemovingIds((prev) => new Set(prev).add(user.id))

    try {
      await CustomersService.removeUser(customer.id, user.id)
      toast.success(`Usuário "${user.name}" removido do cliente.`)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao remover usuário.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
    }
  }

  const loading = loadingUsers || loadingAll

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Gerenciar Usuários</DialogTitle>
          <DialogDescription>
            Gerencie quais usuários podem acessar o cliente{" "}
            <span className="font-medium">{customer.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {submitError}
          </div>
        )}

        {/* Linked users list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UsersIcon className="size-3.5" />
            Usuários vinculados
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : usersError ? (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {usersError}
            </div>
          ) : customerUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum usuário vinculado ainda.
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {customerUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-2.5 py-1.5"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserIcon className="size-3" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-baseline gap-1.5 truncate">
                    <span className="truncate text-xs font-medium">
                      {user.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(user)}
                    disabled={removingIds.has(user.id)}
                    className="ml-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive disabled:opacity-50"
                    title="Remover"
                  >
                    <Trash2Icon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add user section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UserIcon className="size-3.5" />
            Adicionar
          </div>

          {loadingAll ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : availableUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Todos os usuários já estão vinculados.
            </p>
          ) : (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  disabled={isSubmitting || loading}
                  className="w-full justify-between"
                >
                  {selectedUser ? (
                    <span className="flex items-center gap-2">
                      <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                      {selectedUser.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Selecione um usuário...
                    </span>
                  )}
                  <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar usuário..." />
                  <CommandList>
                    <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                    <CommandGroup>
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.name}`}
                          onSelect={() => {
                            setSelectedUser(user)
                            setPopoverOpen(false)
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 size-4",
                              selectedUser?.id === user.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span>{user.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            size="sm"
          >
            Fechar
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedUser || isSubmitting || loading}
            size="sm"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
