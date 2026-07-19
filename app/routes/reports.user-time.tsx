"use client"

import { useEffect, useState, useCallback } from "react"

import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { UserTimeTable } from "~/components/reports/user-time-table"
import { ReportsService, ApiError } from "~/lib/api"
import type { UserTimeUser, ScreenshotFilters } from "~/lib/api/types"

export default function UserTimeReportPage() {
  const [data, setData] = useState<UserTimeUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScreenshotFilters>({})

  const handleApplyFilters = useCallback((newFilters: ScreenshotFilters) => {
    setFilters(newFilters)
  }, [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    ReportsService.userTime(filters)
      .then((res) => {
        if (!cancelled) {
          setData(res.data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message)
          } else {
            setError("Erro ao carregar relatório. Verifique o servidor.")
          }
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [filters])

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Tempo por Usuário
              </h1>
              <p className="text-sm text-muted-foreground">
                Duração total de trackings agrupados por usuário, projeto e
                tarefa.
              </p>
            </div>
            <DashboardFilters onApply={handleApplyFilters} />
          </div>
          <div className="px-4 lg:px-6">
            <UserTimeTable data={data} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    </div>
  )
}
