"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
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

import { InvoiceFormDialog } from "~/components/invoices/invoice-form-dialog"
import { InvoicesService, ApiError } from "~/lib/api"

export const schema = z.object({
  id: z.string(),
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
  // IDs for editing — not displayed in table
  harvest_id: z.string(),
  producer_id: z.string(),
  farm_id: z.string(),
  company_id: z.string(),
  type_id: z.string(),
  supplier_id: z.string(),
  product_id: z.string(),
  unit_id: z.string(),
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
  page,
  perPage,
  totalPages,
  totalCount,
  searchQuery,
  onSearchChange,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSaved,
}: {
  data: z.infer<typeof schema>[]
  page: number
  perPage: number
  totalPages: number
  totalCount: number
  searchQuery: string
  onSearchChange: (value: string) => void
  isLoading: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSaved: () => void
}) {
  const [data, setData] = React.useState(() => initialData)
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [invoiceToDelete, setInvoiceToDelete] =
    React.useState<z.infer<typeof schema> | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [editingInvoice, setEditingInvoice] =
    React.useState<z.infer<typeof schema> | null>(null)

  const handleFormSaved = React.useCallback(() => {
    setFormDialogOpen(false)
    setEditingInvoice(null)
    onSaved()
  }, [onSaved])

  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const prevIsLoadingRef = React.useRef(isLoading)

  React.useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    prevIsLoadingRef.current = isLoading
  }, [isLoading])

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
                onClick={() => {
                  setEditingInvoice(row.original)
                  setFormDialogOpen(true)
                }}
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
        accessorKey: "notaFiscal",
        header: "NF",
        cell: ({ row }) => (
          <div className="font-mono text-sm whitespace-nowrap">{row.original.notaFiscal}</div>
        ),
      },
      {
        accessorKey: "dataNF",
        header: "Data",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">
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
        accessorKey: "quantidade",
        header: "Quant.",
        cell: ({ row }) => (
          <div className="tabular-nums whitespace-nowrap">
            {toNumberBR(row.original.quantidade)}
          </div>
        ),
      },
      {
        accessorKey: "unidade",
        header: "Un.",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.unidade}</div>
        ),
      },
      {
        accessorKey: "precoUnitario",
        header: "Preço Un.",
        cell: ({ row }) => (
          <div className="tabular-nums whitespace-nowrap">
            {toBRL(row.original.precoUnitario)}
          </div>
        ),
      },
      {
        accessorKey: "valorTotal",
        header: "Valor Total",
        cell: ({ row }) => (
          <div className="font-medium tabular-nums whitespace-nowrap">
            {toBRL(row.original.valorTotal)}
          </div>
        ),
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
        accessorKey: "nfOrigem",
        header: "NF Origem",
        cell: ({ row }) => (
          <div className="text-muted-foreground whitespace-nowrap">{row.original.nfOrigem || "—"}</div>
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
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
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
                ref={searchInputRef}
                placeholder="Buscar por número, produtor, fornecedor, produto..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-8 w-96 h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" onClick={() => {
              setEditingInvoice(null)
              setFormDialogOpen(true)
            }}>
              <PlusIcon />
              <span className="hidden lg:inline">Nova Nota Fiscal</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-auto px-4 lg:px-6 relative">
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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Carregando...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">{totalCount} registro(s)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Linhas por página</span>
            <Select
              value={`${perPage}`}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
              }}
            >
              <SelectTrigger className="w-16" size="sm">
                <SelectValue placeholder="25" />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Página {page} de {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <ChevronsLeftIcon />
              <span className="sr-only">Primeira página</span>
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeftIcon />
              <span className="sr-only">Página anterior</span>
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRightIcon />
              <span className="sr-only">Próxima página</span>
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRightIcon />
              <span className="sr-only">Última página</span>
            </Button>
          </div>
        </div>
      </div>

      <InvoiceFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormDialogOpen(false)
            setEditingInvoice(null)
          }
        }}
        editingInvoice={editingInvoice}
        onSaved={handleFormSaved}
      />

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
              disabled={isDeleting}
              onClick={async () => {
                if (!invoiceToDelete) return
                setIsDeleting(true)
                try {
                  await InvoicesService.delete(invoiceToDelete.id)
                  toast.success(`Nota fiscal ${invoiceToDelete.notaFiscal} excluída.`)
                  setDeleteDialogOpen(false)
                  setInvoiceToDelete(null)
                  onSaved()
                } catch (err) {
                  if (err instanceof ApiError) {
                    toast.error(err.message || "Erro ao excluir nota fiscal.")
                  } else {
                    toast.error("Erro de conexão ao excluir.")
                  }
                } finally {
                  setIsDeleting(false)
                }
              }}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
