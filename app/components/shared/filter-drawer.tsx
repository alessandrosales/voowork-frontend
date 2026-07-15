"use client"

import { FilterIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"

interface FilterDrawerProps {
  title?: string
  triggerLabel?: string
  triggerIcon?: React.ReactNode
  children?: React.ReactNode
}

export function FilterDrawer({
  title = "Filtros",
  triggerLabel = "Filtros",
  triggerIcon = <FilterIcon />,
  children,
}: FilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerIcon}
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 p-6 pt-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
