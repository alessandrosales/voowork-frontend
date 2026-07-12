"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { useNavigate } from "react-router"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  EllipsisVerticalIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react"

import { ProjectsService, ApiError } from "~/lib/api"
import type { Project } from "~/lib/api/types"

export function ProjectsTable() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] =
    React.useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingProject, setEditingProject] =
    React.useState<Project | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const [formName, setFormName] = React.useState("")
  const [formFeatured, setFormFeatured] = React.useState(false)

  // --- Fetch data ---
  const fetchProjects = React.useCallback(() => {
    setIsLoading(true)
    setError(null)
    ProjectsService.list()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Erro ao carregar projetos.")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // --- Dialog helpers ---
  const openCreateDialog = () => {
    setEditingProject(null)
    setFormName("")
    setFormFeatured(false)
    setFormError(null)
    setFormDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormName(project.name)
    setFormFeatured(project.featured)
    setFormError(null)
    setFormDialogOpen(true)
  }

  // --- Save (create/update) ---
  const handleSave = async () => {
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (editingProject) {
        await ProjectsService.update(editingProject.id, {
          name: formName,
          featured: formFeatured,
        })
        toast.success("Projeto atualizado com sucesso.")
      } else {
        await ProjectsService.create({
          name: formName,
          featured: formFeatured,
        })
        toast.success("Projeto criado com sucesso.")
      }
      setFormDialogOpen(false)
      fetchProjects()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.entries(err.errors).flatMap(([field, msgs]) =>
            msgs.map((msg) => `${field} ${msg}`),
          )
          setFormError(msgs.join(". "))
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError("Erro de conexão.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Delete ---
  const handleDelete = async () => {
    if (!projectToDelete) return

    setIsDeleting(true)

    try {
      await ProjectsService.delete(projectToDelete.id)
      toast.success("Projeto excluído.")
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      fetchProjects()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao excluir projeto.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // --- Columns ---
  const columns = React.useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: "actions",
        header: () => <div className="w-8" />,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => navigate(`/projetos/${row.original.id}`)}
              >
                Abrir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setProjectToDelete(row.original)
                  setDeleteDialogOpen(true)
                }}
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "featured",
        header: "Destaque",
        cell: ({ row }) => {
          const project = row.original
          const [toggling, setToggling] = React.useState(false)

          const handleToggle = async (e: React.MouseEvent) => {
            e.stopPropagation()
            setToggling(true)
            try {
              await ProjectsService.update(project.id, {
                featured: !project.featured,
              })
              setData((prev) =>
                prev.map((p) =>
                  p.id === project.id
                    ? { ...p, featured: !p.featured }
                    : p,
                ),
              )
              toast.success(
                project.featured
                  ? "Destaque removido."
                  : "Projeto destacado.",
              )
            } catch {
              toast.error("Erro ao alterar destaque.")
            } finally {
              setToggling(false)
            }
          }

          return (
            <div>
              <button
                type="button"
                onClick={handleToggle}
                disabled={toggling}
                className={
                  "cursor-pointer transition-colors disabled:opacity-50 " +
                  (project.featured
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-muted-foreground/30 hover:text-muted-foreground/60")
                }
                title={
                  project.featured
                    ? "Remover destaque"
                    : "Destacar projeto"
                }
              >
                <StarIcon
                  className="size-5"
                  fill={project.featured ? "currentColor" : "none"}
                />
                <span className="sr-only">
                  {project.featured ? "Destacado" : "Não destacado"}
                </span>
              </button>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "tasks_count",
        header: "Tarefas",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.tasks_count}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: () => (
          <div className="w-full text-right">Data de Criação</div>
        ),
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground">
            {new Date(row.original.created_at).toLocaleDateString("pt-BR")}
          </div>
        ),
      },
    ],
    [navigate],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Carregando projetos...</span>
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchProjects}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 self-end">
            <Button size="lg" onClick={openCreateDialog}>
              <PlusIcon />
              <span>Novo Projeto</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={
                          header.column.id === "actions" ? "w-8" : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() => navigate(`/projetos/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          cell.column.id === "actions" ? "w-8" : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum projeto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
          <span className="text-sm">
            {table.getFilteredRowModel().rows.length} registro(s)
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-nowrap">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Linhas por página</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="w-16" size="sm">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon />
              <span className="sr-only">Primeira página</span>
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon />
              <span className="sr-only">Página anterior</span>
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon />
              <span className="sr-only">Próxima página</span>
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon />
              <span className="sr-only">Última página</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editar Projeto" : "Novo Projeto"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Altere os dados do projeto selecionado."
                : "Preencha os dados para criar um novo projeto."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nome do projeto"
                required
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  disabled={isSubmitting}
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-sm font-medium">Projeto em destaque</span>
              </label>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editingProject
                  ? "Salvar"
                  : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto "
              {projectToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setProjectToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
