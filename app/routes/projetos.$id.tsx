"use client"

import { useParams } from "react-router"
import { ProjectDetail } from "~/components/projects/project-detail"

export default function ProjetoDetalhePage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <ProjectDetail projectId={id} />
        </div>
      </div>
    </div>
  )
}
