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

export const schema = z.object({
  id: z.number(),
  safra: z.string(),
  produtor: z.string(),
  fazenda: z.string(),
  nfOrigem: z.string(),
  empresa: z.string(),
  tipo: z.string(),
  notaFiscal: z.string(),
  dataNF: z.string(),
  fornecedor: z.string(),
  produto: z.string(),
  unidade: z.string(),
  quantidade: z.number(),
  precoUnitario: z.number(),
  valorTotal: z.number(),
  entrega: z.string(),
  observacoes: z.string(),
})

function toBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

function toNumberBR(value: number, decimals = 2) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function InvoicesTable({
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

  const [safraFilter, setSafraFilter] = React.useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [invoiceToDelete, setInvoiceToDelete] =
    React.useState<z.infer<typeof schema> | null>(null)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingInvoice, setEditingInvoice] =
    React.useState<z.infer<typeof schema> | null>(null)

  const [formSafra, setFormSafra] = React.useState("")
  const [formProdutor, setFormProdutor] = React.useState("")
  const [formFazenda, setFormFazenda] = React.useState("")
  const [formNfOrigem, setFormNfOrigem] = React.useState("")
  const [formEmpresa, setFormEmpresa] = React.useState("")
  const [formTipo, setFormTipo] = React.useState("")
  const [formNotaFiscal, setFormNotaFiscal] = React.useState("")
  const [formDataNF, setFormDataNF] = React.useState("")
  const [formFornecedor, setFormFornecedor] = React.useState("")
  const [formProduto, setFormProduto] = React.useState("")
  const [formUnidade, setFormUnidade] = React.useState("TO")
  const [formQuantidade, setFormQuantidade] = React.useState("")
  const [formPrecoUnitario, setFormPrecoUnitario] = React.useState("")
  const [formValorTotal, setFormValorTotal] = React.useState("")
  const [formEntrega, setFormEntrega] = React.useState("")
  const [formObservacoes, setFormObservacoes] = React.useState("")

  const openCreateDialog = () => {
    setEditingInvoice(null)
    setFormSafra("")
    setFormProdutor("")
    setFormFazenda("")
    setFormNfOrigem("")
    setFormEmpresa("")
    setFormTipo("")
    setFormNotaFiscal("")
    setFormDataNF("")
    setFormFornecedor("")
    setFormProduto("")
    setFormUnidade("TO")
    setFormQuantidade("")
    setFormPrecoUnitario("")
    setFormValorTotal("")
    setFormEntrega("")
    setFormObservacoes("")
    setFormDialogOpen(true)
  }

  const openEditDialog = (invoice: z.infer<typeof schema>) => {
    setEditingInvoice(invoice)
    setFormSafra(invoice.safra)
    setFormProdutor(invoice.produtor)
    setFormFazenda(invoice.fazenda)
    setFormNfOrigem(invoice.nfOrigem)
    setFormEmpresa(invoice.empresa)
    setFormTipo(invoice.tipo)
    setFormNotaFiscal(invoice.notaFiscal)
    setFormDataNF(invoice.dataNF)
    setFormFornecedor(invoice.fornecedor)
    setFormProduto(invoice.produto)
    setFormUnidade(invoice.unidade)
    setFormQuantidade(String(invoice.quantidade))
    setFormPrecoUnitario(String(invoice.precoUnitario))
    setFormValorTotal(String(invoice.valorTotal))
    setFormEntrega(invoice.entrega)
    setFormObservacoes(invoice.observacoes)
    setFormDialogOpen(true)
  }

  const handleSave = () => {
    const action = editingInvoice ? "editada" : "criada"
    toast.promise(new Promise((resolve) => setTimeout(resolve, 500)), {
      loading: editingInvoice
        ? `Salvando NF ${formNotaFiscal}...`
        : `Criando NF ${formNotaFiscal}...`,
      success: `Nota fiscal ${action} (simulado)`,
      error: "Erro",
    })
    setFormDialogOpen(false)
    setEditingInvoice(null)
  }

  React.useEffect(() => {
    if (safraFilter === "all") {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "safra"))
    } else {
      setColumnFilters((prev) => {
        const others = prev.filter((f) => f.id !== "safra")
        return [...others, { id: "safra", value: safraFilter }]
      })
    }
  }, [safraFilter])

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
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => openEditDialog(row.original)}
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setInvoiceToDelete(row.original)
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
        accessorKey: "safra",
        header: "Safra",
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-[11px]">
            {row.original.safra}
          </Badge>
        ),
      },
      {
        accessorKey: "produtor",
        header: "Produtor",
        cell: ({ row }) => (
          <div className="font-medium whitespace-nowrap">{row.original.produtor}</div>
        ),
      },
      {
        accessorKey: "fazenda",
        header: "Fazenda",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.fazenda}</div>
        ),
      },
      {
        accessorKey: "notaFiscal",
        header: "NF",
        cell: ({ row }) => (
          <div className="font-mono text-sm whitespace-nowrap">{row.original.notaFiscal}</div>
        ),
      },
      {
        accessorKey: "dataNF",
        header: () => <div className="w-full text-right">Data</div>,
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground whitespace-nowrap">
            {new Date(row.original.dataNF).toLocaleDateString("pt-BR")}
          </div>
        ),
      },
      {
        accessorKey: "fornecedor",
        header: "Fornecedor",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.fornecedor}</div>
        ),
      },
      {
        accessorKey: "produto",
        header: "Produto",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">{row.original.produto}</div>
        ),
      },
      {
        accessorKey: "unidade",
        header: () => <div className="w-full text-center">Un.</div>,
        cell: ({ row }) => (
          <div className="text-center text-muted-foreground whitespace-nowrap">{row.original.unidade}</div>
        ),
      },
      {
        accessorKey: "quantidade",
        header: () => <div className="w-full text-right">Quant.</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums whitespace-nowrap">
            {toNumberBR(row.original.quantidade)}
          </div>
        ),
      },
      {
        accessorKey: "precoUnitario",
        header: () => <div className="w-full text-right">Preço Un.</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums whitespace-nowrap">
            {toBRL(row.original.precoUnitario)}
          </div>
        ),
      },
      {
        accessorKey: "valorTotal",
        header: () => <div className="w-full text-right">Valor Total</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums whitespace-nowrap">
            {toBRL(row.original.valorTotal)}
          </div>
        ),
      },
      {
        accessorKey: "nfOrigem",
        header: "NF Origem",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.nfOrigem || "—"}</div>
        ),
      },
      {
        accessorKey: "empresa",
        header: "Empresa",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.empresa || "—"}</div>
        ),
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.tipo || "—"}</div>
        ),
      },
      {
        accessorKey: "entrega",
        header: "Entrega",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.entrega || "—"}</div>
        ),
      },
      {
        accessorKey: "observacoes",
        header: "Obs.",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.observacoes || "—"}</div>
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
                placeholder="Buscar notas fiscais..."
                value={(table.getColumn("produtor")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("produtor")?.setFilterValue(event.target.value)
                }
                className="pl-8 w-64 h-8"
              />
            </div>
            <Select value={safraFilter} onValueChange={setSafraFilter}>
              <SelectTrigger className="w-44 !h-8">
                <SelectValue placeholder="Filtrar por safra" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todas as safras</SelectItem>
                  <SelectItem value="SOJA 24/25">SOJA 24/25</SelectItem>
                  <SelectItem value="MILHO 23/24">MILHO 23/24</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" onClick={openCreateDialog}>
              <PlusIcon />
              <span className="hidden lg:inline">Nova Nota Fiscal</span>
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
                        className={header.column.id === "actions" ? "w-8" : "whitespace-nowrap"}
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
                        className={cell.column.id === "actions" ? "w-8" : "whitespace-nowrap"}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Editar Nota Fiscal" : "Nova Nota Fiscal"}
            </DialogTitle>
            <DialogDescription>
              {editingInvoice
                ? "Altere os dados da nota fiscal selecionada."
                : "Preencha os dados para criar uma nova nota fiscal."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="safra">Safra</FieldLabel>
              <Input
                id="safra"
                value={formSafra}
                onChange={(e) => setFormSafra(e.target.value)}
                placeholder="ex: SOJA 24/25"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="produtor">Produtor</FieldLabel>
              <Input
                id="produtor"
                value={formProdutor}
                onChange={(e) => setFormProdutor(e.target.value)}
                placeholder="Nome do produtor"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fazenda">Fazenda</FieldLabel>
              <Input
                id="fazenda"
                value={formFazenda}
                onChange={(e) => setFormFazenda(e.target.value)}
                placeholder="Nome da fazenda"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="nfOrigem">NF Origem</FieldLabel>
              <Input
                id="nfOrigem"
                value={formNfOrigem}
                onChange={(e) => setFormNfOrigem(e.target.value)}
                placeholder="Número da NF de origem"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="empresa">Empresa</FieldLabel>
              <Input
                id="empresa"
                value={formEmpresa}
                onChange={(e) => setFormEmpresa(e.target.value)}
                placeholder="Empresa compradora"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tipo">Tipo</FieldLabel>
              <Input
                id="tipo"
                value={formTipo}
                onChange={(e) => setFormTipo(e.target.value)}
                placeholder="Tipo da operação"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="notaFiscal">Nota Fiscal</FieldLabel>
              <Input
                id="notaFiscal"
                value={formNotaFiscal}
                onChange={(e) => setFormNotaFiscal(e.target.value)}
                placeholder="Número da NF"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dataNF">Data NF</FieldLabel>
              <Input
                id="dataNF"
                type="date"
                value={formDataNF}
                onChange={(e) => setFormDataNF(e.target.value)}
              />
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="fornecedor">Fornecedor</FieldLabel>
              <Input
                id="fornecedor"
                value={formFornecedor}
                onChange={(e) => setFormFornecedor(e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="produto">Produto</FieldLabel>
              <Input
                id="produto"
                value={formProduto}
                onChange={(e) => setFormProduto(e.target.value)}
                placeholder="Nome do produto"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="unidade">Unidade</FieldLabel>
              <Select value={formUnidade} onValueChange={setFormUnidade}>
                <SelectTrigger id="unidade" className="!h-8">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="TO">TO (Tonelada)</SelectItem>
                    <SelectItem value="KG">KG (Quilograma)</SelectItem>
                    <SelectItem value="L">L (Litro)</SelectItem>
                    <SelectItem value="SC">SC (Saca)</SelectItem>
                    <SelectItem value="UN">UN (Unidade)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="quantidade">Quantidade</FieldLabel>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                value={formQuantidade}
                onChange={(e) => setFormQuantidade(e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="precoUnitario">Preço Unitário (R$)</FieldLabel>
              <Input
                id="precoUnitario"
                type="number"
                step="0.01"
                value={formPrecoUnitario}
                onChange={(e) => setFormPrecoUnitario(e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="valorTotal">Valor Total (R$)</FieldLabel>
              <Input
                id="valorTotal"
                type="number"
                step="0.01"
                value={formValorTotal}
                onChange={(e) => setFormValorTotal(e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="entrega">Entrega</FieldLabel>
              <Input
                id="entrega"
                value={formEntrega}
                onChange={(e) => setFormEntrega(e.target.value)}
                placeholder="Status/data de entrega"
              />
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
              <Input
                id="observacoes"
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                placeholder="Observações adicionais"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingInvoice ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota fiscal</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a nota fiscal "
              {invoiceToDelete?.notaFiscal}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setInvoiceToDelete(null)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 500)),
                  {
                    loading: `Excluindo NF ${invoiceToDelete?.notaFiscal}...`,
                    success: "Nota fiscal excluída",
                    error: "Erro ao excluir",
                  }
                )
                setInvoiceToDelete(null)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
