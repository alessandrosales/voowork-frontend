"use client"

import { useEffect, useState } from "react"
import { InvoicesTable, schema } from "~/components/invoices/invoices-table"
import { Button } from "~/components/ui/button"
import { InvoicesService, ApiError } from "~/lib/api"
import type { Invoice } from "~/lib/api/types"
import type { z } from "zod"

export default function InvoicesPage() {
  const [data, setData] = useState<z.infer<typeof schema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = () => {
    setIsLoading(true)
    setError(null)
    InvoicesService.list()
      .then((invoices) => setData(invoices.map(mapInvoiceToDisplay)))
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Erro ao carregar notas fiscais.")
        }
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col gap-1 px-4 lg:px-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                Notas Fiscais
              </h1>
            </div>
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Carregando notas fiscais...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex flex-col gap-1 px-4 lg:px-6">
              <h1 className="text-2xl font-semibold tracking-tight">
                Notas Fiscais
              </h1>
            </div>
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchInvoices}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Notas Fiscais
            </h1>
          </div>
          <InvoicesTable data={data} />
        </div>
      </div>
    </div>
  )
}

function mapInvoiceToDisplay(invoice: Invoice): z.infer<typeof schema> {
  return {
    id: invoice.id,
    safra: invoice.harvest_id,
    produtor: invoice.producer_id,
    fazenda: invoice.farm_id,
    nfOrigem: invoice.origin_invoice_id ?? "",
    empresa: invoice.company_id,
    tipo: invoice.type_id,
    notaFiscal: invoice.number,
    dataNF: invoice.date,
    fornecedor: invoice.supplier_id,
    produto: invoice.product_id,
    unidade: invoice.unit_id,
    quantidade: invoice.quantity,
    precoUnitario: invoice.unit_price,
    valorTotal: invoice.total_value,
    entrega: invoice.delivery ?? "",
    observacoes: invoice.notes ?? "",
  }
}
