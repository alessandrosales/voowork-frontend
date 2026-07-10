import { ChartAreaInteractive } from "~/components/dashboard/chart-area-interactive"
import { LowStockTable } from "~/components/dashboard/low-stock-table"
import { SectionCards } from "~/components/dashboard/section-cards"

import inventoryData from "../inventory/data.json"
import movementsData from "../inventory/movements.json"

export default function Page() {
  const totalEntradas = movementsData
    .filter((m) => m.tipo === "entrada")
    .reduce((sum, m) => sum + m.quantidade, 0)

  const totalSaidas = movementsData
    .filter((m) => m.tipo === "saida")
    .reduce((sum, m) => sum + m.quantidade, 0)

  const produtosComQtdMin = inventoryData.filter(
    (p) => p.qtdAtual <= p.qtdMinima
  ).length

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            entradas={totalEntradas}
            saidas={totalSaidas}
            produtosComQtdMin={produtosComQtdMin}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <div className="px-4 lg:px-6">
            <LowStockTable data={inventoryData} />
          </div>
        </div>
      </div>
    </div>
  )
}
