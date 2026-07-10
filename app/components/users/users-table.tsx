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
} from "lucide-react"

import { useAuth } from "~/hooks/use-auth"
import { UsersService, ApiError } from "~/lib/api"
import type { User } from "~/lib/api/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function UsersTable() {
  const { user: currentUser } = useAuth()
  const [data, setData] = React.useState<User[]>([])
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
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const [formName, setFormName] = React.useState("")
  const [formEmail, setFormEmail] = React.useState("")
  const [formPhone, setFormPhone] = React.useState("")
  const [formPassword, setFormPassword] = React.useState("")
  const [formPasswordConfirmation, setFormPasswordConfirmation] =
    React.useState("")

  // --- Fetch data ---
  const fetchUsers = React.useCallback(() => {
    setIsLoading(true)
    setError(null)
    UsersService.list()
      .then(setData)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Erro ao carregar usuários.")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // --- Dialog helpers ---
  const openCreateDialog = () => {
    setEditingUser(null)
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormPassword("")
    setFormPasswordConfirmation("")
    setFormError(null)
    setFormDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormPhone(user.phone ?? "")
    setFormPassword("")
    setFormPasswordConfirmation("")
    setFormError(null)
    setFormDialogOpen(true)
  }

  // --- Save (create/update) ---
  const handleSave = async () => {
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (editingUser) {
        await UsersService.update(editingUser.id, {
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          ...(formPassword ? { password: formPassword, password_confirmation: formPasswordConfirmation } : {}),
        })
        toast.success("Usuário atualizado com sucesso.")
      } else {
        if (!formPassword || formPassword.length < 8) {
          setFormError("A senha deve ter pelo menos 8 caracteres.")
          setIsSubmitting(false)
          return
        }
        if (formPassword !== formPasswordConfirmation) {
          setFormError("As senhas não conferem.")
          setIsSubmitting(false)
          return
        }
        await UsersService.create({
          name: formName,
          email: formEmail,
          phone: formPhone || undefined,
          password: formPassword,
          password_confirmation: formPasswordConfirmation,
        })
        toast.success("Usuário criado com sucesso.")
      }
      setFormDialogOpen(false)
      fetchUsers()
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
    if (!userToDelete) return

    if (userToDelete.id === currentUser?.id) {
      toast.error("Você não pode excluir seu próprio usuário.")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      return
    }

    setIsDeleting(true)

    try {
      await UsersService.delete(userToDelete.id)
      toast.success("Usuário excluído.")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Erro ao excluir usuário.")
      } else {
        toast.error("Erro de conexão.")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // --- Columns ---
  const columns = React.useMemo<ColumnDef<User>[]>(
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
                disabled={row.original.id === currentUser?.id}
                onClick={() => {
                  if (row.original.id === currentUser?.id) {
                    toast.error("Você não pode excluir seu próprio usuário.")
                    return
                  }
                  setUserToDelete(row.original)
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
          <span className="text-sm">Carregando usuários...</span>
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
          <Button variant="outline" onClick={fetchUsers}>
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
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="w-64 pl-8 h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" onClick={openCreateDialog}>
              <PlusIcon />
              <span className="hidden lg:inline">Novo Usuário</span>
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
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">
            {table.getFilteredRowModel().rows.length} registro(s)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Altere os dados do usuário selecionado."
                : "Preencha os dados para criar um novo usuário."}
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
              <FieldLabel htmlFor="password">
                {editingUser ? "Nova senha (deixe em branco para manter)" : "Senha"}
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder={editingUser ? "Nova senha" : "Mínimo 8 caracteres"}
                minLength={editingUser ? undefined : 8}
                required={!editingUser}
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
                : editingUser
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
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário "
              {userToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setUserToDelete(null)}
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
