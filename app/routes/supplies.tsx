import { SuppliesTable, schema } from "~/components/supplies-table"
import type { z } from "zod"

import rawData from "../supplies/data.json"
const data = rawData as z.infer<typeof schema>[]

export default function SuppliesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Insumos
            </h1>
          </div>
          <SuppliesTable data={data} />
        </div>
      </div>
    </div>
  )
}
