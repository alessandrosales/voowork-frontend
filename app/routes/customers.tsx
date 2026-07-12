import { CustomersTable } from "~/components/customers/customers-table"

export default function CustomersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Clientes
            </h1>
          </div>
          <CustomersTable />
        </div>
      </div>
    </div>
  )
}
