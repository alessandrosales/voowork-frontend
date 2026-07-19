"use client"

import { useEffect, useState } from "react"

import { Button } from "~/components/ui/button"
import { DatePickerInput } from "~/components/shared/date-picker-input"
import { FilterDrawer } from "~/components/shared/filter-drawer"
import { UsersService, ProjectsService, ApiError } from "~/lib/api"
import type { ScreenshotFilters } from "~/lib/api/types"

import { PeriodFilter } from "./period-filter"
import { ProjectFilter } from "./project-filter"
import type { ProjectOption } from "./project-filter"
import { UserFilter } from "./user-filter"
import type { UserOption } from "./user-filter"

/* ------------------------------------------------------------------ */
/*  Converte período em parâmetros de data                            */
/* ------------------------------------------------------------------ */

function periodToParams(
  period: string,
  startDate?: string,
  endDate?: string,
): { captured_after?: string; captured_before?: string } {
  const now = new Date()
  const params: { captured_after?: string; captured_before?: string } = {}

  switch (period) {
    case "today":
      params.captured_after = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString()
      break
    case "week":
      params.captured_after = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString()
      break
    case "month":
      params.captured_after = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString()
      break
    case "custom":
      if (startDate) params.captured_after = new Date(startDate).toISOString()
      if (endDate) params.captured_before = new Date(endDate).toISOString()
      break
  }

  return params
}

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface DashboardFiltersProps {
  onApply?: (filters: ScreenshotFilters) => void
}

export function DashboardFilters({ onApply }: DashboardFiltersProps) {
  const [period, setPeriod] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [userId, setUserId] = useState("all")
  const [projectId, setProjectId] = useState("all")

  const [userOptions, setUserOptions] = useState<UserOption[]>([])
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [selectsLoading, setSelectsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      UsersService.listAll(),
      ProjectsService.list(),
    ])
      .then(([users, projects]) => {
        if (cancelled) return

        setUserOptions(
          users.map((u) => ({ value: u.id, label: u.name })),
        )
        setProjectOptions(
          projects.map((p) => ({ value: p.id, label: p.name })),
        )
        setSelectsLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error("Erro ao carregar opções dos filtros:", err)
        setSelectsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handleApply() {
    const dateParams = periodToParams(period, startDate, endDate)

    const filters: ScreenshotFilters = {
      ...dateParams,
    }

    if (userId !== "all") {
      filters.user_id = userId
    }

    if (projectId !== "all") {
      filters.project_id = projectId
    }

    onApply?.(filters)
  }

  return (
    <FilterDrawer>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Período
        </label>
        <PeriodFilter value={period} onChange={setPeriod} />
        {period === "custom" && (
          <div className="mt-3 flex flex-col gap-3">
            <DatePickerInput
              value={startDate}
              onChange={setStartDate}
              placeholder="Data inicial"
            />
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              placeholder="Data final"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Usuário
        </label>
        <UserFilter
          value={userId}
          onChange={setUserId}
          users={userOptions}
          loading={selectsLoading}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Projeto
        </label>
        <ProjectFilter
          value={projectId}
          onChange={setProjectId}
          projects={projectOptions}
          loading={selectsLoading}
        />
      </div>
      <Button className="mt-2 w-full" onClick={handleApply}>
        Filtrar
      </Button>
    </FilterDrawer>
  )
}
