"use client"

import { ClockIcon } from "lucide-react"

export default function ActivitiesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Activity Reports
            </h1>
            <p className="text-muted-foreground text-sm">
              Visualize os relatórios de atividades.
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center px-4 lg:px-6">
            <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
              <ClockIcon className="size-12" />
              <p className="text-lg font-medium">Em breve</p>
              <p className="text-sm">
                Esta funcionalidade está sendo desenvolvida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
