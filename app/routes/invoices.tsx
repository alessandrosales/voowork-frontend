"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { InvoicesTable, schema } from "~/components/invoices/invoices-table"
import { Button } from "~/components/ui/button"
import { InvoicesService, ApiError } from "~/lib/api"
import type { Invoice } from "~/lib/api/types"
import type { z } from "zod"

export default function InvoicesPage() {
  const [data, setData] = useState<z.infer<typeof schema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  const fetchInvoices = useCallback(
    async (p: number, q?: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await InvoicesService.list(p, perPage, q)
        setData(res.data.map(mapInvoiceToDisplay))
        setPage(res.meta.page)
        setTotalPages(res.meta.total_pages)
        setTotalCount(res.meta.total_count)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError("Erro ao carregar notas fiscais.")
        }
      } finally {
        setIsLoading(false)
      }
    },
    [perPage],
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchInvoices(1, searchQuery)
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchInvoices(1, searchQuery)
    }, 500)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, fetchInvoices])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchInvoices(newPage, searchQuery)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPerPage(newSize)
    setPage(1)
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

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
                <Button variant="outline" onClick={() => fetchInvoices(1)}>
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
          <InvoicesTable
            data={data}
            page={page}
            perPage={perPage}
            totalPages={totalPages}
            totalCount={totalCount}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSaved={() => fetchInvoices(page, searchQuery)}
          />
        </div>
      </div>
    </div>
  )
}

function mapInvoiceToDisplay(invoice: Invoice): z.infer<typeof schema> {
  return {
    id: invoice.id,
    safra: invoice.harvest_name ?? invoice.harvest_id,
    produtor: invoice.producer_name ?? invoice.producer_id,
    fazenda: invoice.farm_name ?? invoice.farm_id,
    nfOrigem: invoice.origin_invoice_number ?? "",
    empresa: invoice.company_name ?? invoice.company_id,
    tipo: invoice.type_name ?? invoice.type_id,
    notaFiscal: invoice.number,
    dataNF: invoice.date,
    fornecedor: invoice.supplier_name ?? invoice.supplier_id,
    produto: invoice.product_name ?? invoice.product_id,
    unidade: invoice.unit_name ?? invoice.unit_id,
    quantidade: invoice.quantity,
    precoUnitario: invoice.unit_price,
    valorTotal: invoice.total_value,
    entrega: invoice.delivery ?? "",
    observacoes: invoice.notes ?? "",
    harvest_id: invoice.harvest_id,
    producer_id: invoice.producer_id,
    farm_id: invoice.farm_id,
    company_id: invoice.company_id,
    type_id: invoice.type_id,
    supplier_id: invoice.supplier_id,
    product_id: invoice.product_id,
    unit_id: invoice.unit_id,
  }
}
