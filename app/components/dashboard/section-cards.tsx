"use client"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
} from "lucide-react"

interface SectionCardsProps {
  entradas: number
  saidas: number
  produtosComQtdMin: number
}

export function SectionCards({
  entradas,
  saidas,
  produtosComQtdMin,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Entradas de Insumos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {entradas.toLocaleString("pt-BR")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ArrowDownToLine className="size-3" />
              Entrada
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total de unidades recebidas
            <ArrowDownToLine className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Soma de todas as movimentações de entrada
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saídas de Insumos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {saidas.toLocaleString("pt-BR")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ArrowUpFromLine className="size-3" />
              Saída
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total de unidades vendidas
            <ArrowUpFromLine className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Soma de todas as movimentações de saída
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Insumos com Qtd. Mín.</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {produtosComQtdMin.toLocaleString("pt-BR")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-destructive text-destructive">
              <AlertTriangle className="size-3" />
              Atenção
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Estoque abaixo ou no limite mínimo
            <AlertTriangle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Insumos que precisam de reposição
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
