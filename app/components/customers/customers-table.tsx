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

import { Badge } from "~/components/ui/badge"
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
  CircleCheckIcon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react"

import { CustomersService, ApiError } from "~/lib/api"
import type { Customer } from "~/lib/api/types"

const STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "invited", label: "Convidado" },
  { value: "inactive", label: "Inativo" },
] as const

function getStatusBadge(status: Customer["status"]) {
  switch (status) {
    case "active":
      return {
        icon: CircleCheckIcon,
        className: "fill-green-500 dark:fill-green-400",
        label: "Ativo",
      }
    case "invited":
      return {
        icon: ClockIcon,
        className: "fill-amber-500 dark:fill-amber-400",
        label: "Convidado",
      }
    case "inactive":
      return {
        icon: XCircleIcon,
        className: "fill-red-500 dark:fill-red-400",
        label: "Inativo",
      }
  }
}

export function CustomersTable() {
  const [data, setData] = React.useState<Customer[]>([])
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

  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [customerToDelete, setCustomerToDelete] = React.useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const [formName, setFormName] = React.useState("")
  const [formEmail, setFormEmail] = React.useState("")
  const [formPhone, setFormPhone] = React.useState("")
  const [formStatus, setFormStatus] = React.useState<string>("active")
  const [formPassword, setFormPassword] = React.useState("")
  const [formPasswordConfirmation, setFormPasswordConfirmation] =
    React.useState("")

  // --- Fetch data ---
  const fetchCustomers = React.useCallback(() => {
    setIsLoading(true)
    setError(null)
    CustomersService.list()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Erro ao carregar clientes.")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // --- Dialog helpers ---
  const openCreateDialog = () => {
    setEditingCustomer(null)
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormStatus("active")
    setFormPassword("")
    setFormPasswordConfirmation("")
    setFormError(null)
    setFormDialogOpen(true)
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormName(customer.name)
    setFormEmail(customer.email)
    setFormPhone(customer.phone ?? "")
    setFormStatus(customer.status)
    setFormPassword("")
    setFormPasswordConfirmation("")
    setFormError(null)
    setFormDialogOpen(true)
  }

  // --- Save (create/update) ---
  const handleSave = async () => {
    setFormError(null)
    setIsSubmitting(true)

    if (formPassword && formPassword !== formPasswordConfirmation) {
      setFormError("As senhas não conferem.")
      setIsSubmitting(false)
      return
    }

    try {
      if (editingCustomer) {
        await CustomersService.update(editingCustomer.id, {
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          status: formStatus,
          ...(formPassword
            ? {
                password: formPassword,
                password_confirmation: formPasswordConfirmation,
              }
            : {}),
        })
        toast.success("Cliente atualizado com sucesso.")
      } else {
        await CustomersService.create({
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          status: formStatus,
          ...(formPassword
            ? {
                password: formPassword,
                password_confirmation: formPasswordConfirmation,
              }
            : {}),
        })
        toast.success("Cliente criado com sucesso.")
      }
      setFormDialogOpen(false)
      fetchCustomers()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.values(err.errors).flat()
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
    if (!customerToDelete) return

    setIsDeleting(true)

    try {
      await CustomersService.delete(customerToDelete.id)
      toast.success("Cliente excluído.")
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
      fetchCustomers()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao excluir cliente.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // --- Sync status filter with column filters ---
  React.useEffect(() => {
    if (statusFilter === "all") {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "status"))
    } else {
      setColumnFilters((prev) => {
        const others = prev.filter((f) => f.id !== "status")
        return [...others, { id: "status", value: statusFilter }]
      })
    }
  }, [statusFilter])

  // --- Columns ---
  const columns = React.useMemo<ColumnDef<Customer>[]>(
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
              <DropdownMenuItem onClick={() => openEditDialog(row.original)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setCustomerToDelete(row.original)
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
        accessorKey: "email",
        header: "E-mail",
        cell: ({ row }) => (
          <div className="text-muted-foreground">{row.original.email}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Telefone",
        cell: ({ row }) => (
          <div className="text-muted-foreground">
            {row.original.phone || "—"}
          </div>
        ),
      },
      {
        id: "projects",
        header: "Projetos",
        cell: ({ row }) => {
          const projects = row.original.projects
          if (!projects || projects.length === 0) return <span className="text-muted-foreground">—</span>

          const visible = projects.slice(0, 2)
          const remaining = projects.length - 2

          return (
            <div className="flex items-center gap-1 flex-wrap">
              {visible.map((p) => (
                <span
                  key={p.id}
                  className="truncate max-w-24 rounded-md bg-muted px-1.5 py-0.5 text-[0.625rem] text-muted-foreground"
                >
                  {p.name}
                </span>
              ))}
              {remaining > 0 && (
                <span className="text-[0.625rem] text-muted-foreground">
                  +{remaining}
                </span>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const badge = getStatusBadge(row.original.status)
          const Icon = badge.icon
          return (
            <Badge variant="outline" className="px-1.5 text-muted-foreground">
              <Icon className={badge.className} />
              {badge.label}
            </Badge>
          )
        },
        filterFn: (row, _columnId, filterValue) => {
          return row.original.status === filterValue
        },
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
    [],
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
          <span className="text-sm">Carregando clientes...</span>
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
          <Button variant="outline" onClick={fetchCustomers}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Toolbar: search + status filter + new button */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full h-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 !h-8">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 self-end">
            <Button size="lg" onClick={openCreateDialog}>
              <PlusIcon />
              <span>Novo Cliente</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
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
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-row items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex items-center h-8 gap-2 text-muted-foreground whitespace-nowrap">
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
              {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? "Altere os dados do cliente selecionado."
                : "Preencha os dados para criar um novo cliente."}
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
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
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
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+5511999999999"
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-status">Status</FieldLabel>
              <Select
                value={formStatus}
                onValueChange={setFormStatus}
                disabled={isSubmitting}
              >
                <SelectTrigger id="form-status" className="!h-8">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">
                {editingCustomer
                  ? "Nova senha (deixe em branco para manter)"
                  : "Senha (opcional)"}
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={
                  editingCustomer ? "Nova senha" : "Mínimo 8 caracteres"
                }
                minLength={editingCustomer ? undefined : 8}
                disabled={isSubmitting}
              />
            </Field>
            {formPassword && (
              <Field>
                <FieldLabel htmlFor="password-confirmation">
                  Confirmar Senha
                </FieldLabel>
                <Input
                  id="password-confirmation"
                  type="password"
                  value={formPasswordConfirmation}
                  onChange={(e) =>
                    setFormPasswordConfirmation(e.target.value)
                  }
                  placeholder="Repita a senha"
                  disabled={isSubmitting}
                />
              </Field>
            )}
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
                : editingCustomer
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
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente &ldquo;
              {customerToDelete?.name}&rdquo;? Esta ação não pode ser desfeita.
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
