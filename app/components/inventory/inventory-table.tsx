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
import { z } from "zod"

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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
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
  TriangleAlertIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react"

import movementsRaw from "../../inventory/movements.json"

export const schema = z.object({
  id: z.number(),
  produto: z.string(),
  qtdMinima: z.number(),
  qtdMaxima: z.number(),
  qtdAtual: z.number(),
  fornecedorPrincipal: z.string(),
  dataCriacao: z.string(),
})

const movementSchema = z.object({
  id: z.number(),
  produtoId: z.number(),
  tipo: z.enum(["entrada", "saida"]),
  quantidade: z.number(),
  data: z.string(),
  observacao: z.string(),
})

const movements = movementsRaw as z.infer<typeof movementSchema>[]

export function InventoryTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] =
    React.useState<z.infer<typeof schema> | null>(null)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingItem, setEditingItem] =
    React.useState<z.infer<typeof schema> | null>(null)

  const [formProduto, setFormProduto] = React.useState("")
  const [formQtdMinima, setFormQtdMinima] = React.useState("")
  const [formQtdMaxima, setFormQtdMaxima] = React.useState("")
  const [formQtdAtual, setFormQtdAtual] = React.useState("")
  const [formFornecedor, setFormFornecedor] = React.useState("")

  const [movementsDialogOpen, setMovementsDialogOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] =
    React.useState<z.infer<typeof schema> | null>(null)

  const openCreateDialog = () => {
    setEditingItem(null)
    setFormProduto("")
    setFormQtdMinima("")
    setFormQtdMaxima("")
    setFormQtdAtual("")
    setFormFornecedor("")
    setFormDialogOpen(true)
  }

  const openEditDialog = (item: z.infer<typeof schema>) => {
    setEditingItem(item)
    setFormProduto(item.produto)
    setFormQtdMinima(item.qtdMinima.toString())
    setFormQtdMaxima(item.qtdMaxima.toString())
    setFormQtdAtual(item.qtdAtual.toString())
    setFormFornecedor(item.fornecedorPrincipal)
    setFormDialogOpen(true)
  }

  const openMovementsDialog = (item: z.infer<typeof schema>) => {
    setSelectedItem(item)
    setMovementsDialogOpen(true)
  }

  const handleSave = () => {
    const action = editingItem ? "editado" : "criado"
    toast.promise(new Promise((resolve) => setTimeout(resolve, 500)), {
      loading: editingItem
        ? `Salvando ${formProduto}...`
        : `Criando ${formProduto}...`,
      success: `Item ${action} (simulado)`,
      error: "Erro",
    })
    setFormDialogOpen(false)
    setEditingItem(null)
  }

  const columns = React.useMemo<ColumnDef<z.infer<typeof schema>>[]>(
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => openEditDialog(row.original)}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openMovementsDialog(row.original)}
              >
                Lançamentos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setItemToDelete(row.original)
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
        accessorKey: "produto",
        header: "Insumo",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.produto}</div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "qtdMinima",
        header: () => <div className="w-full text-right">Qtd. Mínima</div>,
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground">
            {row.original.qtdMinima}
          </div>
        ),
      },
      {
        accessorKey: "qtdMaxima",
        header: () => <div className="w-full text-right">Qtd. Máxima</div>,
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground">
            {row.original.qtdMaxima}
          </div>
        ),
      },
      {
        accessorKey: "qtdAtual",
        header: () => <div className="w-full text-right">Qtd. Atual</div>,
        cell: ({ row }) => {
          const belowMin = row.original.qtdAtual < row.original.qtdMinima
          return (
            <div className="flex items-center justify-end gap-1">
              {belowMin && (
                <TriangleAlertIcon className="size-4 text-amber-500" />
              )}
              <span
                className={
                  belowMin
                    ? "font-semibold text-amber-600"
                    : "text-muted-foreground"
                }
              >
                {row.original.qtdAtual}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "fornecedorPrincipal",
        header: "Fornecedor Principal",
        cell: ({ row }) => (
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.fornecedorPrincipal}
          </Badge>
        ),
      },
      {
        accessorKey: "dataCriacao",
        header: () => (
          <div className="w-full text-right">Data de Criação</div>
        ),
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground">
            {new Date(row.original.dataCriacao).toLocaleDateString("pt-BR")}
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar insumos..."
                value={(table.getColumn("produto")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("produto")?.setFilterValue(event.target.value)
                }
                className="pl-8 w-64 h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" onClick={openCreateDialog}>
              <PlusIcon />
              <span className="hidden lg:inline">Novo Item</span>
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
                        className={header.column.id === "actions" ? "w-8" : undefined}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                        className={cell.column.id === "actions" ? "w-8" : undefined}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
                    Nenhum resultado encontrado.
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

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Item" : "Novo Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Altere os dados do item selecionado."
                : "Preencha os dados para criar um novo item de estoque."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="produto">Insumo</FieldLabel>
              <Input
                id="produto"
                value={formProduto}
                onChange={(e) => setFormProduto(e.target.value)}
                placeholder="Nome do insumo"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="qtdMinima">Qtd. Mínima</FieldLabel>
              <Input
                id="qtdMinima"
                type="number"
                value={formQtdMinima}
                onChange={(e) => setFormQtdMinima(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="qtdMaxima">Qtd. Máxima</FieldLabel>
              <Input
                id="qtdMaxima"
                type="number"
                value={formQtdMaxima}
                onChange={(e) => setFormQtdMaxima(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="qtdAtual">Qtd. Atual</FieldLabel>
              <Input
                id="qtdAtual"
                type="number"
                value={formQtdAtual}
                onChange={(e) => setFormQtdAtual(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fornecedor">Fornecedor Principal</FieldLabel>
              <Input
                id="fornecedor"
                value={formFornecedor}
                onChange={(e) => setFormFornecedor(e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o item "
              {itemToDelete?.produto}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setItemToDelete(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 500)),
                  {
                    loading: `Excluindo ${itemToDelete?.produto}...`,
                    success: "Item excluído",
                    error: "Erro ao excluir",
                  }
                )
                setItemToDelete(null)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={movementsDialogOpen} onOpenChange={setMovementsDialogOpen}>
        <DialogContent className="max-w-lg min-w-0">
          <DialogHeader>
            <DialogTitle>Lançamentos — {selectedItem?.produto}</DialogTitle>
            <DialogDescription>
              Histórico de entradas e saídas do insumo.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <Tabs defaultValue="entradas">
              <TabsList>
                <TabsTrigger value="entradas">
                  <ArrowUpIcon data-icon="inline-start" />
                  Entradas
                </TabsTrigger>
                <TabsTrigger value="saidas">
                  <ArrowDownIcon data-icon="inline-start" />
                  Saídas
                </TabsTrigger>
              </TabsList>
              <TabsContent value="entradas" className="mt-4">
                <MovementsTable
                  items={movements.filter(
                    (m) => m.produtoId === selectedItem.id && m.tipo === "entrada"
                  )}
                  tipo="entrada"
                />
              </TabsContent>
              <TabsContent value="saidas" className="mt-4">
                <MovementsTable
                  items={movements.filter(
                    (m) => m.produtoId === selectedItem.id && m.tipo === "saida"
                  )}
                  tipo="saida"
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MovementsTable({
  items,
  tipo,
}: {
  items: z.infer<typeof movementSchema>[]
  tipo: "entrada" | "saida"
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma {tipo === "entrada" ? "entrada" : "saída"} registrada.
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full caption-bottom text-xs table-fixed">
        <thead className="bg-muted [&_tr]:border-b">
          <tr className="border-b transition-colors">
            <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground w-[30%]">
              Data
            </th>
            <th className="h-10 px-2 text-right align-middle font-medium whitespace-nowrap text-foreground w-[25%]">
              Quantidade
            </th>
            <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground w-[45%]">
              Observação
            </th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {items.map((item) => (
            <tr key={item.id} className="border-b transition-colors">
              <td className="p-2 align-middle whitespace-nowrap">
                {new Date(item.data).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-2 align-middle whitespace-nowrap text-right">
                <Badge
                  variant="outline"
                  className={
                    tipo === "entrada"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {tipo === "entrada" ? "+" : "-"}
                  {item.quantidade}
                </Badge>
              </td>
              <td className="p-2 align-middle truncate text-muted-foreground">
                {item.observacao}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
