"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  FolderIcon,
  FolderOpenIcon,
  Trash2Icon,
  UserIcon,
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
import { UsersService, ProjectsService, ApiError } from "~/lib/api"
import type { User, UserProfile, ProjectMember } from "~/lib/api/types"

interface ManageUserProjectsDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  editor: "Editor",
  viewer: "Visualizador",
}

const PROFILE_OPTIONS: {
  value: UserProfile
  label: string
  variant: "default" | "secondary" | "destructive"
}[] = [
  { value: "common", label: "Comum", variant: "secondary" },
  { value: "manager", label: "Gestor", variant: "default" },
  { value: "admin", label: "Admin", variant: "default" },
]

function getProfileOption(
  profile: unknown
): (typeof PROFILE_OPTIONS)[number] | undefined {
  if (typeof profile !== "string") return undefined
  return PROFILE_OPTIONS.find((opt) => opt.value === profile)
}

export function ManageUserProjectsDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ManageUserProjectsDialogProps) {
  const [allProjects, setAllProjects] = React.useState<
    { id: string; name: string }[]
  >([])
  const [loadingAll, setLoadingAll] = React.useState(true)

  const [memberships, setMemberships] = React.useState<ProjectMember[]>([])
  const [loadingMemberships, setLoadingMemberships] = React.useState(true)
  const [membershipsError, setMembershipsError] = React.useState<string | null>(
    null,
  )

  const [selectedProject, setSelectedProject] = React.useState<{
    id: string
    name: string
  } | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const [removingIds, setRemovingIds] = React.useState<Set<string>>(new Set())

  // Set of project IDs the user is already a member of
  const memberProjectIds = React.useMemo(() => {
    return new Set(memberships.map((m) => m.project_id))
  }, [memberships])

  // Projects not yet linked
  const availableProjects = React.useMemo(() => {
    return allProjects.filter((p) => !memberProjectIds.has(p.id))
  }, [allProjects, memberProjectIds])

  // Build a map of project_id -> membership for quick lookup
  const membershipMap = React.useMemo(() => {
    const map = new Map<string, ProjectMember>()
    for (const m of memberships) map.set(m.project_id, m)
    return map
  }, [memberships])

  // Fetch data when dialog opens
  const fetchData = React.useCallback(() => {
    if (!open) return

    setLoadingMemberships(true)
    setLoadingAll(true)
    setMembershipsError(null)
    setSubmitError(null)
    setSelectedProject(null)

    Promise.all([
      UsersService.listProjectMemberships(user.id)
        .then((res) => setMemberships(res.data))
        .catch((err) => {
          if (err instanceof ApiError) {
            setMembershipsError(err.message)
          } else {
            setMembershipsError("Erro ao carregar projetos do usuário.")
          }
        })
        .finally(() => setLoadingMemberships(false)),
      ProjectsService.list()
        .then((projects) =>
          setAllProjects(projects.map((p) => ({ id: p.id, name: p.name }))),
        )
        .catch(() => {})
        .finally(() => setLoadingAll(false)),
    ])
  }, [open, user.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async () => {
    if (!selectedProject) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await UsersService.addProjectMembership(user.id, selectedProject.id)
      toast.success(
        `Usuário vinculado ao projeto "${selectedProject.name}".`,
      )
      setSelectedProject(null)
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

  const handleRemove = async (projectId: string) => {
    setRemovingIds((prev) => new Set(prev).add(projectId))

    try {
      await UsersService.removeProjectMembership(user.id, projectId)
      toast.success(`Usuário removido do projeto.`)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao remover usuário do projeto.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(projectId)
        return next
      })
    }
  }

  const loading = loadingMemberships || loadingAll

  const opt = getProfileOption(user.profile)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Vincular a Projetos</DialogTitle>
          <DialogDescription>
            Gerencie os projetos do usuário{" "}
            <span className="font-medium">{user.name}</span>
            {opt && (
              <Badge
                variant={opt.variant}
                className="ml-1.5 px-1.5 py-0 text-[0.625rem] leading-none"
              >
                {opt.label}
              </Badge>
            )}
            .
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {submitError}
          </div>
        )}

        {/* Memberships list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <FolderOpenIcon className="size-3.5" />
            Projetos vinculados
          </div>

          {loadingMemberships ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : membershipsError ? (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {membershipsError}
            </div>
          ) : memberships.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum projeto vinculado ainda.
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {memberships.map((membership) => {
                const project = allProjects.find(
                  (p) => p.id === membership.project_id,
                )
                return (
                  <div
                    key={membership.id}
                    className="flex items-center gap-2 px-2.5 py-1.5"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <FolderIcon className="size-3" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-baseline gap-1.5 truncate">
                      <span className="truncate text-xs font-medium">
                        {project?.name ?? membership.project_id}
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 px-1.5 py-0 text-[0.625rem] leading-none text-muted-foreground"
                      >
                        {ROLE_LABELS[membership.role] ?? membership.role}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(membership.project_id)}
                      disabled={removingIds.has(membership.project_id)}
                      className="ml-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive disabled:opacity-50"
                      title="Remover"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Add project section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <FolderIcon className="size-3.5" />
            Adicionar
          </div>

          {loadingAll ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : availableProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Todos os projetos já estão vinculados.
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
                  {selectedProject ? (
                    <span className="flex items-center gap-2">
                      <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
                      {selectedProject.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Selecione um projeto...
                    </span>
                  )}
                  <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Buscar projeto..." />
                  <CommandList>
                    <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {availableProjects.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={project.name}
                          onSelect={() => {
                            setSelectedProject(project)
                            setPopoverOpen(false)
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 size-4",
                              selectedProject?.id === project.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span>{project.name}</span>
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
            disabled={!selectedProject || isSubmitting || loading}
            size="sm"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
