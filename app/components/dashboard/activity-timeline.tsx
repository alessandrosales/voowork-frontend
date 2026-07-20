"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import type { TimelineBlock, TimelineDay as ApiTimelineDay } from "~/lib/api/types"

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface ActivityConfig {
  label: string
  color: string
}

export interface ActivitySegment {
  type: string
  startHour: number
  endHour: number
}

export interface TimelineDay {
  date: string
  dayLabel: string
  timeWorked: string
  isWeekend: boolean
  segments: ActivitySegment[]
}

interface ActivityTimelineProps {
  activities?: Record<string, ActivityConfig>
  days?: TimelineDay[]
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const HOUR_MARKERS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, "0")}:00`,
  hour: i,
}))

const DEFAULT_ACTIVITIES: Record<string, ActivityConfig> = {
  computer: { label: "Tempo no Computador", color: "bg-emerald-500" },
  manual: { label: "Tempo Manual", color: "bg-amber-400" },
  mobile: { label: "Tempo Mobile", color: "bg-blue-500" },
  break: { label: "Tempo de Pausa", color: "bg-gray-400" },
  leave: { label: "Tempo de Ausência", color: "bg-purple-500" },
}

/* ------------------------------------------------------------------ */
/*  Helpers (from reports.timeline.tsx)                                */
/* ------------------------------------------------------------------ */

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

function localDateOf(isoString: string): string {
  const d = new Date(isoString)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function convertToComponentDays(apiDays: ApiTimelineDay[]): TimelineDay[] {
  // 1. Flatten all blocks and re-group by local date
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

  // 2. Convert to component format
  const days: TimelineDay[] = []
  for (const [date, { blocks, totalSeconds }] of byLocalDate) {
    const segments = blocks.map((b): ActivitySegment => {
      const startHour = toDecimalHour(b.started_at)
      const endIso = b.ended_at ?? new Date().toISOString()
      const endHour = toDecimalHour(endIso)
      // If endHour < startHour, the block crosses midnight — cap at 24
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

  // 3. Sort most recent first
  days.sort((a, b) => b.date.localeCompare(a.date))

  return days
}

/* ------------------------------------------------------------------ */
/*  TimelineCell                                                      */
/* ------------------------------------------------------------------ */

function TimelineCell({
  segments,
  activities,
}: {
  segments: ActivitySegment[]
  activities: Record<string, ActivityConfig>
}) {
  if (segments.length === 0) {
    return <div className="relative h-5 w-full" />
  }

  return (
    <div className="relative h-5 w-full">
      {segments.map((segment, i) => {
        const left = (segment.startHour / 24) * 100
        const width = ((segment.endHour - segment.startHour) / 24) * 100
        return (
          <div
            key={i}
            className={`absolute top-0 h-full rounded-sm ${activities[segment.type]?.color ?? "bg-foreground/20"}`}
            style={{
              left: `${left}%`,
              width: `${Math.max(width, 2)}%`,
              minWidth: "14px",
            }}
          />
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  ActivityTimeline                                                   */
/* ------------------------------------------------------------------ */

export function ActivityTimeline({
  activities = DEFAULT_ACTIVITIES,
  days = [],
}: ActivityTimelineProps) {
  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Timelines</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        {days.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Nenhum registro encontrado para o período.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[88px] px-2 whitespace-nowrap">
                      Data
                    </TableHead>
                    <TableHead className="w-[84px] px-2 whitespace-nowrap text-xs">
                      Tempo
                    </TableHead>
                    <TableHead className="px-2">
                      <div className="relative h-4 w-full min-w-[720px]">
                        {HOUR_MARKERS.map((marker) => (
                          <span
                            key={marker.label}
                            className="absolute top-0 text-[10px] text-muted-foreground"
                            style={{ left: `${(marker.hour / 24) * 100}%` }}
                          >
                            {marker.label}
                          </span>
                        ))}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {days.map((day) => (
                    <TableRow
                      key={day.date}
                      className={`group ${day.isWeekend ? "opacity-60" : ""}`}
                    >
                      <TableCell className="w-[88px] px-2 whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          {day.dayLabel}
                          {day.isWeekend && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none font-normal">
                              Fim de semana
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="w-[84px] px-2 whitespace-nowrap">
                        {day.timeWorked}
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="w-full min-w-[720px]">
                          <TimelineCell
                            segments={day.segments}
                            activities={activities}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end border-t px-4 py-3">
              <div className="flex flex-wrap gap-4 text-xs">
                {Object.entries(activities).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className={`size-3 rounded-sm ${config.color}`} />
                    <span className="text-muted-foreground">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
