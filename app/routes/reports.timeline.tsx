"use client"

import { useEffect, useState, useCallback, useMemo } from "react"

import { ActivityTimeline } from "~/components/dashboard/activity-timeline"
import { DashboardFilters } from "~/components/dashboard/dashboard-filters"
import { ReportsService, ApiError } from "~/lib/api"
import type {
  TimelineBlock,
  TimelineDay as ApiTimelineDay,
  ScreenshotFilters,
} from "~/lib/api/types"
import type {
  TimelineDay as ComponentTimelineDay,
  ActivitySegment,
} from "~/components/dashboard/activity-timeline"

/* ---------- Helpers ---------- */

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return "< 1m"
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" })
  const day = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })
  return `${dayName}, ${day}`
}

function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr + "T00:00:00")
  const day = date.getDay()
  return day === 0 || day === 6
}

function toDecimalHour(isoString: string): number {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return 0
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600
}

/** Extrai data local (YYYY-MM-DD) de um timestamp ISO */
function localDateOf(isoString: string): string {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/* ---------- Data conversion ---------- */

function convertToComponentDays(apiDays: ApiTimelineDay[]): ComponentTimelineDay[] {
  // 1. Flatten todos os blocos e re-agrupa por data LOCAL
  const byLocalDate = new Map<
    string,
    { blocks: TimelineBlock[]; totalSeconds: number }
  >()

  for (const day of apiDays) {
    for (const block of day.blocks) {
      if (!block.started_at) continue
      const localDate = localDateOf(block.started_at)
      if (!byLocalDate.has(localDate)) {
        byLocalDate.set(localDate, { blocks: [], totalSeconds: 0 })
      }
      const entry = byLocalDate.get(localDate)!
      entry.blocks.push(block)
      entry.totalSeconds += block.duration_seconds
    }
  }

  // 2. Converte para o formato do componente
  const days: ComponentTimelineDay[] = []
  for (const [date, { blocks, totalSeconds }] of byLocalDate) {
    const segments = blocks.map((b): ActivitySegment => {
      const startHour = toDecimalHour(b.started_at)
      const endIso = b.ended_at ?? new Date().toISOString()
      const endHour = toDecimalHour(endIso)
      // Se endHour < startHour, o bloco cruza meia-noite — cap em 24
      const safeEndHour = endHour > startHour ? endHour : 24
      return {
        type: "computer",
        startHour,
        endHour: Math.min(safeEndHour, 24),
      }
    })

    days.push({
      date,
      dayLabel: formatDateLabel(date),
      timeWorked: formatDuration(totalSeconds),
      isWeekend: isWeekend(date),
      segments,
    })
  }

  // 3. Ordena do mais recente para o mais antigo
  days.sort((a, b) => b.date.localeCompare(a.date))

  return days
}

/* ---------- Page ---------- */

export default function TimelineReportPage() {
  const [data, setData] = useState<ApiTimelineDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ScreenshotFilters>({})

  const componentDays = useMemo(() => convertToComponentDays(data), [data])

  const handleApplyFilters = useCallback((newFilters: ScreenshotFilters) => {
    setFilters(newFilters)
  }, [])

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    ReportsService.timeline(filters)
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
