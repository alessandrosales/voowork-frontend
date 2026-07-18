"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  FolderIcon,
  FolderOpenIcon,
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
import { CustomersService, ProjectsService, ApiError } from "~/lib/api"
import type { Customer } from "~/lib/api/types"

interface ManageCustomerProjectsDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ManageCustomerProjectsDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: ManageCustomerProjectsDialogProps) {
  const [allProjects, setAllProjects] = React.useState<
    { id: string; name: string }[]
  >([])
  const [loadingAll, setLoadingAll] = React.useState(true)

  const [customerProjects, setCustomerProjects] = React.useState<
    { id: string; name: string }[]
  >([])
  const [loadingProjects, setLoadingProjects] = React.useState(true)
  const [projectsError, setProjectsError] = React.useState<string | null>(null)

  const [selectedProject, setSelectedProject] = React.useState<{
    id: string
    name: string
  } | null>(null)
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const [removingIds, setRemovingIds] = React.useState<Set<string>>(new Set())

  // Set of project IDs already linked
  const linkedProjectIds = React.useMemo(() => {
    return new Set(customerProjects.map((p) => p.id))
  }, [customerProjects])

  // Projects not yet linked
  const availableProjects = React.useMemo(() => {
    return allProjects.filter((p) => !linkedProjectIds.has(p.id))
  }, [allProjects, linkedProjectIds])

  // Fetch data when dialog opens
  const fetchData = React.useCallback(() => {
    if (!open) return

    setLoadingProjects(true)
    setLoadingAll(true)
    setProjectsError(null)
    setSubmitError(null)
    setSelectedProject(null)

    Promise.all([
      CustomersService.listProjects(customer.id)
        .then((res) => setCustomerProjects(res.data))
        .catch((err) => {
          if (err instanceof ApiError) {
            setProjectsError(err.message)
          } else {
            setProjectsError("Erro ao carregar projetos do cliente.")
          }
        })
        .finally(() => setLoadingProjects(false)),
      ProjectsService.list()
        .then((projects) =>
          setAllProjects(projects.map((p) => ({ id: p.id, name: p.name }))),
        )
        .catch(() => {})
        .finally(() => setLoadingAll(false)),
    ])
  }, [open, customer.id])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = async () => {
    if (!selectedProject) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      await CustomersService.addProject(customer.id, selectedProject.id)
      toast.success(
        `Projeto "${selectedProject.name}" vinculado ao cliente.`,
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

  const handleRemove = async (project: { id: string; name: string }) => {
    setRemovingIds((prev) => new Set(prev).add(project.id))

    try {
      await CustomersService.removeProject(customer.id, project.id)
      toast.success(`Projeto "${project.name}" removido do cliente.`)
      fetchData()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao remover projeto.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(project.id)
        return next
      })
    }
  }

  const loading = loadingProjects || loadingAll

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Gerenciar Projetos</DialogTitle>
          <DialogDescription>
            Gerencie quais projetos o cliente{" "}
            <span className="font-medium">{customer.name}</span> pode acessar.
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {submitError}
          </div>
        )}

        {/* Linked projects list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <FolderOpenIcon className="size-3.5" />
            Projetos vinculados
          </div>

          {loadingProjects ? (
            <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
              <div className="mr-2 size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Carregando...
            </div>
          ) : projectsError ? (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {projectsError}
            </div>
          ) : customerProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum projeto vinculado ainda.
            </p>
          ) : (
            <div className="flex flex-col divide-y rounded-lg border">
              {customerProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-2 px-2.5 py-1.5"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FolderIcon className="size-3" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-baseline gap-1.5 truncate">
                    <span className="truncate text-xs font-medium">
                      {project.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(project)}
                    disabled={removingIds.has(project.id)}
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
