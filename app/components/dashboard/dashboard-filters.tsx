"use client"

import { useState } from "react"

import { Button } from "~/components/ui/button"
import { DatePickerInput } from "~/components/shared/date-picker-input"
import { FilterDrawer } from "~/components/shared/filter-drawer"

import { PeriodFilter } from "./period-filter"
import { ProjectFilter } from "./project-filter"
import { UserFilter } from "./user-filter"

export function DashboardFilters() {
  const [period, setPeriod] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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
        <UserFilter />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Projeto
        </label>
        <ProjectFilter />
      </div>
      <Button className="w-full mt-2">Filtrar</Button>
    </FilterDrawer>
  )
}
