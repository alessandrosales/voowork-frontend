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

const DEFAULT_DAYS: TimelineDay[] = [
  {
    date: "2026-07-15",
    dayLabel: "Qua, 15 Jul",
    timeWorked: "0m",
    isWeekend: false,
    segments: [],
  },
  {
    date: "2026-07-14",
    dayLabel: "Ter, 14 Jul",
    timeWorked: "8h 36m",
    isWeekend: false,
    segments: [
      { type: "computer", startHour: 9.5, endHour: 9.75 },
      { type: "computer", startHour: 10.0, endHour: 10.25 },
      { type: "computer", startHour: 10.5, endHour: 12.0 },
      { type: "computer", startHour: 12.25, endHour: 12.75 },
      { type: "computer", startHour: 13.0, endHour: 13.25 },
      { type: "computer", startHour: 13.5, endHour: 14.0 },
      { type: "computer", startHour: 14.25, endHour: 14.5 },
      { type: "computer", startHour: 14.75, endHour: 15.0 },
      { type: "computer", startHour: 15.25, endHour: 16.0 },
      { type: "computer", startHour: 16.25, endHour: 16.5 },
      { type: "computer", startHour: 16.75, endHour: 17.0 },
      { type: "computer", startHour: 17.25, endHour: 18.0 },
      { type: "computer", startHour: 18.25, endHour: 18.5 },
      { type: "computer", startHour: 18.75, endHour: 20.0 },
      { type: "computer", startHour: 20.25, endHour: 21.0 },
      { type: "computer", startHour: 21.25, endHour: 21.5 },
    ],
  },
  {
    date: "2026-07-13",
    dayLabel: "Seg, 13 Jul",
    timeWorked: "4h 17m",
    isWeekend: false,
    segments: [
      { type: "computer", startHour: 9.75, endHour: 10.0 },
      { type: "computer", startHour: 10.25, endHour: 11.0 },
      { type: "computer", startHour: 11.25, endHour: 12.0 },
      { type: "computer", startHour: 14.25, endHour: 14.5 },
      { type: "computer", startHour: 14.75, endHour: 15.5 },
      { type: "computer", startHour: 15.75, endHour: 16.0 },
      { type: "computer", startHour: 16.25, endHour: 16.5 },
    ],
  },
  {
    date: "2026-07-12",
    dayLabel: "Dom, 12 Jul",
    timeWorked: "0m",
    isWeekend: true,
    segments: [],
  },
  {
    date: "2026-07-11",
    dayLabel: "Sáb, 11 Jul",
    timeWorked: "0m",
    isWeekend: true,
    segments: [],
  },
  {
    date: "2026-07-10",
    dayLabel: "Sex, 10 Jul",
    timeWorked: "4h 55m",
    isWeekend: false,
    segments: [
      { type: "computer", startHour: 9.75, endHour: 10.0 },
      { type: "computer", startHour: 10.25, endHour: 10.5 },
      { type: "computer", startHour: 10.75, endHour: 11.0 },
      { type: "computer", startHour: 15.0, endHour: 15.5 },
      { type: "computer", startHour: 15.75, endHour: 16.0 },
      { type: "computer", startHour: 20.25, endHour: 20.5 },
      { type: "computer", startHour: 20.75, endHour: 21.0 },
    ],
  },
  {
    date: "2026-07-09",
    dayLabel: "Qui, 9 Jul",
    timeWorked: "4h 15m",
    isWeekend: false,
    segments: [
      { type: "computer", startHour: 9.0, endHour: 9.25 },
      { type: "computer", startHour: 9.5, endHour: 9.75 },
      { type: "computer", startHour: 10.0, endHour: 11.5 },
      { type: "computer", startHour: 11.75, endHour: 12.0 },
      { type: "computer", startHour: 14.0, endHour: 14.5 },
      { type: "computer", startHour: 14.75, endHour: 15.0 },
      { type: "computer", startHour: 17.0, endHour: 17.25 },
      { type: "computer", startHour: 17.5, endHour: 17.75 },
    ],
  },
]

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

export function ActivityTimeline({
  activities = DEFAULT_ACTIVITIES,
  days = DEFAULT_DAYS,
}: ActivityTimelineProps) {
  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Timelines</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0">
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
      </CardContent>
    </Card>
  )
}
