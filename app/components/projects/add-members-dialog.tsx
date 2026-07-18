"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  UserIcon,
  UsersIcon,
  ShieldIcon,
  PencilIcon,
  EyeIcon,
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
import { cn } from "~/lib/utils"
import { ProjectsService, UsersService, ApiError } from "~/lib/api"
import type { User, ProjectMember } from "~/lib/api/types"

interface AddMembersDialogProps {
  projectId: string
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  editor: "Editor",
  viewer: "Visualizador",
}

const ROLE_ICONS: Record<string, typeof ShieldIcon> = {
  owner: ShieldIcon,
  editor: PencilIcon,
  viewer: EyeIcon,
}

export function AddMembersDialog({
  projectId,
  projectName,
  open,
  onOpenChange,
  onSuccess,
}: AddMembersDialogProps) {
  const [users, setUsers] = React.useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = React.useState(true)
  const [usersError, setUsersError] = React.useState<string | null>(null)

  const [members, setMembers] = React.useState<ProjectMember[]>([])
  const [loadingMembers, setLoadingMembers] = React.useState(true)
  const [membersError, setMembersError] = React.useState<string | null>(null)

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // Track which members are having their role updated
  const [updatingRoles, setUpdatingRoles] = React.useState<Set<string>>(
    new Set(),
  )

  const [memberToDelete, setMemberToDelete] =
    React.useState<ProjectMember | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDeleteMember = async () => {
    if (!memberToDelete) return

    setIsDeleting(true)
    try {
      await ProjectsService.deleteMember(projectId, memberToDelete.id)
      toast.success("Membro removido do projeto.")
      setDeleteConfirmOpen(false)
      setMemberToDelete(null)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao remover membro.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRoleChange = async (
    memberId: string,
    newRole: string,
  ) => {
    setUpdatingRoles((prev) => new Set(prev).add(memberId))
    try {
      const updated = await ProjectsService.updateMemberRole(
        projectId,
        memberId,
        newRole,
      )
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? updated : m)),
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
        next.delete(memberId)
        return next
      })
    }
  }

  // Build user lookup map
  const userMap = React.useMemo(() => {
    const map = new Map<string, User>()
    for (const u of users) map.set(u.id, u)
    return map
  }, [users])

  // Set of user IDs already in the project
  const memberUserIds = React.useMemo(() => {
    return new Set(members.map((m) => m.user_id))
  }, [members])

  // Users not yet added to the project
  const availableUsers = React.useMemo(() => {
    return users.filter((u) => !memberUserIds.has(u.id))
  }, [users, memberUserIds])

  // Fetch data when dialog opens
  const fetchData = React.useCallback(() => {
    if (!open) return

    setLoadingMembers(true)
    setLoadingUsers(true)
    setMembersError(null)
    setUsersError(null)
    setSelectedUser(null)
    setSubmitError(null)

    Promise.all([
      ProjectsService.listMembers(projectId)
        .then((res) => setMembers(res.data))
        .catch((err) => {
          if (err instanceof ApiError) {
            setMembersError(err.message)
          } else {
            setMembersError("Erro ao carregar membros.")
          }
        })
        .finally(() => setLoadingMembers(false)),
      UsersService.list()
        .then((res) => setUsers(res.data))
        .catch((err) => {
          if (err instanceof ApiError) {
            setUsersError(err.message)
          } else {
            setUsersError("Erro ao carregar usuários.")
          }
        })
        .finally(() => setLoadingUsers(false)),
    ])
  }, [open, projectId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async () => {
    if (!selectedUser) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await ProjectsService.addMember(projectId, selectedUser.id)
      toast.success(`Membro "${selectedUser.name}" adicionado ao projeto.`)
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

  const loading = loadingMembers || loadingUsers

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Gerenciar Membros</DialogTitle>
          <DialogDescription>
            Gerencie os membros do projeto "{projectName}".
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {submitError}
          </div>
        )}

        {/* Existing members list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UsersIcon className="size-3.5" />
            Membros atuais
          </div>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : membersError ? (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {membersError}
            </div>
          ) : members.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum membro ainda.</p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {members.map((member) => {
                const user = userMap.get(member.user_id)
                const RoleIcon = ROLE_ICONS[member.role] ?? EyeIcon

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-2.5 py-1.5"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <UserIcon className="size-3" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-baseline gap-1.5 truncate">
                      <span className="truncate text-xs font-medium">
                        {user?.name ?? member.user_id}
                      </span>
                      <span className="shrink-0 truncate text-[0.625rem] text-muted-foreground">
                        {user?.email ?? "—"}
                      </span>
                    </div>
                    <Select
                      value={member.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(member.id, newRole)
                      }
                      disabled={updatingRoles.has(member.id)}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-6 w-28 gap-1 px-1.5 text-[0.625rem]"
                      >
                        <RoleIcon className="size-2.5 shrink-0" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["owner", "editor", "viewer"] as const).map(
                          (role) => (
                            <SelectItem
                              key={role}
                              value={role}
                              className="text-xs"
                            >
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                      <button
                        type="button"
                        onClick={() => {
                          setMemberToDelete(member)
                          setDeleteConfirmOpen(true)
                        }}
                        className="ml-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive"
                        title="Remover membro"
                      >
                        <Trash2Icon className="size-3" />
                      </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add new member section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <UserIcon className="size-3.5" />
            Adicionar
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
          ) : availableUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">Todos já são membros.</p>
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

        {/* Delete confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover membro</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este membro do projeto? Esta
                ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setMemberToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDeleteMember}
                disabled={isDeleting}
              >
                {isDeleting ? "Removendo..." : "Remover"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
            onClick={handleSubmit}
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
