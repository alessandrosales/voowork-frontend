"use client"

import { useEffect, useState, useCallback, useMemo } from "react"

import { ActivityTimeline, convertToComponentDays } from "~/components/dashboard/activity-timeline"
import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ReportsService, ScreenshotsService, ApiError } from "~/lib/api"
import type {
  Screenshot,
  TimelineDay as ApiTimelineDay,
  ScreenshotFilters,
} from "~/lib/api/types"

/* ---------- Page ---------- */

export default function TimelineReportPage() {
  const [data, setData] = useState<ApiTimelineDay[]>([])
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScreenshotFilters>({})

  const componentDays = useMemo(
    () => convertToComponentDays(data, screenshots),
    [data, screenshots],
  )

  const handleApplyFilters = useCallback((newFilters: ScreenshotFilters) => {
    setFilters(newFilters)
  }, [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    Promise.all([
      ReportsService.timeline(filters),
      ScreenshotsService.list({ ...filters, limit: 20 }),
    ])
      .then(([timeline, ss]) => {
        if (!cancelled) {
          setData(timeline.data)
          setScreenshots(ss.data)
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
                Linha do Tempo
              </h1>
              <p className="text-sm text-muted-foreground">
                Trackings organizados por dia com horários de início e fim.
              </p>
            </div>
            <DashboardFilters onApply={handleApplyFilters} />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Carregando timeline...</span>
              </div>
            </div>
          ) : error ? (
            <div className="mx-4 rounded-md bg-destructive/10 p-4 text-sm text-destructive lg:mx-6">
              {error}
            </div>
          ) : componentDays.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Nenhum registro encontrado para o período selecionado.
            </div>
          ) : (
            <div className="px-4 lg:px-6">
              <ActivityTimeline days={componentDays} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
