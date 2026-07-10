import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { Badge } from "~/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface InventoryItem {
  id: number
  produto: string
  qtdMinima: number
  qtdMaxima: number
  qtdAtual: number
  fornecedorPrincipal: string
  dataCriacao: string
}

interface LowStockTableProps {
  data: InventoryItem[]
}

export function LowStockTable({ data }: LowStockTableProps) {
  const lowStockItems = data
    .filter((item) => item.qtdAtual <= item.qtdMinima)
    .sort((a, b) => a.qtdAtual - b.qtdAtual)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-2 px-4 lg:px-6">
        <AlertTriangle className="size-5 text-destructive" />
        <h2 className="text-lg font-semibold tracking-tight">
          Insumos com Estoque Baixo
        </h2>
        <Badge variant="outline" className="ml-auto">
          {lowStockItems.length} insumo{lowStockItems.length !== 1 ? "s" : ""}
        </Badge>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Insumo</TableHead>
              <TableHead className="text-right">Qtd. Atual</TableHead>
              <TableHead className="text-right">Qtd. Mínima</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum insumo com estoque baixo
                </TableCell>
              </TableRow>
            ) : (
              lowStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.produto}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.qtdAtual.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.qtdMinima.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>{item.fornecedorPrincipal}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className="border-destructive text-destructive"
                    >
                      <AlertTriangle className="size-3" />
                      Estoque Baixo
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
