import { UsersTable, schema } from "~/components/users-table"
import type { z } from "zod"

import rawData from "../users/data.json"
const data = rawData as z.infer<typeof schema>[]

export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Usuários
            </h1>
          </div>
          <UsersTable data={data} />
        </div>
      </div>
    </div>
  )
}
