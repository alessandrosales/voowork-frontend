import { CategoriesTable } from "~/components/categories/categories-table"

import data from "../categories/data.json"

export default function CategoriesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Categorias
            </h1>
          </div>
          <CategoriesTable data={data} />
        </div>
      </div>
    </div>
  )
}
