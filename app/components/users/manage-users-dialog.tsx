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
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { UsersService, ApiError } from "~/lib/api"
import type { User, UserProfile } from "~/lib/api/types"

interface ManageUsersDialogProps {
  manager: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PROFILE_OPTIONS: { value: UserProfile; label: string; variant: "default" | "secondary" | "destructive" }[] = [
  { value: "common", label: "Comum", variant: "secondary" },
  { value: "manager", label: "Gestor", variant: "default" },
  { value: "admin", label: "Admin", variant: "default" },
]

function getProfileOption(profile: unknown): (typeof PROFILE_OPTIONS)[number] | undefined {
  if (typeof profile !== "string") return undefined
  return PROFILE_OPTIONS.find((opt) => opt.value === profile)
}

export function ManageUsersDialog({
  manager,
  open,
  onOpenChange,
  onSuccess,
}: ManageUsersDialogProps) {
  const [allUsers, setAllUsers] = React.useState<User[]>([])
  const [loadingAll, setLoadingAll] = React.useState(true)

  const [managedUsers, setManagedUsers] = React.useState<User[]>([])
  const [loadingManaged, setLoadingManaged] = React.useState(true)
  const [managedError, setManagedError] = React.useState<string | null>(null)

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const [removingIds, setRemovingIds] = React.useState<Set<string>>(new Set())

  // Set of user IDs already managed
  const managedUserIds = React.useMemo(() => {
    return new Set(managedUsers.map((u) => u.id))
  }, [managedUsers])

  // Users not yet managed
  const availableUsers = React.useMemo(() => {
    return allUsers.filter(
      (u) => !managedUserIds.has(u.id) && u.id !== manager.id,
    )
  }, [allUsers, managedUserIds, manager.id])

  // Fetch data when dialog opens
  const fetchData = React.useCallback(() => {
    if (!open) return

    setLoadingManaged(true)
    setLoadingAll(true)
    setManagedError(null)
    setSubmitError(null)
    setSelectedUser(null)

    Promise.all([
      UsersService.listManagedUsers(manager.id)
        .then(setManagedUsers)
        .catch((err) => {
          if (err instanceof ApiError) {
            setManagedError(err.message)
          } else {
            setManagedError("Erro ao carregar usuários gerenciados.")
          }
        })
        .finally(() => setLoadingManaged(false)),
      UsersService.list()
        .then(setAllUsers)
        .catch(() => {})
        .finally(() => setLoadingAll(false)),
    ])
  }, [open, manager.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async () => {
    if (!selectedUser) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await UsersService.addManagedUser(manager.id, selectedUser.id)
      toast.success(`Usuário "${selectedUser.name}" adicionado aos gerenciados.`)
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

  const handleRemove = async (user: User) => {
    setRemovingIds((prev) => new Set(prev).add(user.id))

    try {
      await UsersService.removeManagedUser(manager.id, user.id)
      toast.success(`Usuário "${user.name}" removido dos gerenciados.`)
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

  const loading = loadingManaged || loadingAll

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Gerenciar Usuários</DialogTitle>
          <DialogDescription>
            Gerencie quais usuários estão sob responsabilidade de{" "}
            <span className="font-medium">{manager.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {submitError}
          </div>
        )}

        {/* Managed users list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UsersIcon className="size-3.5" />
            Usuários gerenciados
          </div>

          {loadingManaged ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : managedError ? (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {managedError}
            </div>
          ) : managedUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum usuário gerenciado ainda.
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {managedUsers.map((user) => {
                const opt = getProfileOption(user.profile)
                return (
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
                      <span className="shrink-0 truncate text-[0.625rem] text-muted-foreground">
                        {user.email}
                      </span>
                      {opt && (
                        <Badge
                          variant={opt.variant}
                          className="shrink-0 px-1.5 py-0 text-[0.625rem] leading-none"
                        >
                          {opt.label}
                        </Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(user)}
                      disabled={removingIds.has(user.id)}
                      className="ml-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive disabled:opacity-50"
                      title="Remover dos gerenciados"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </div>
                )
              })}
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
              Todos os usuários já estão gerenciados.
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
                      <span className="text-muted-foreground">
                        ({selectedUser.email})
                      </span>
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
                          value={`${user.name} ${user.email}`}
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
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-[0.625rem] text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
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
