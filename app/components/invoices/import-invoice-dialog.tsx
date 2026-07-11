"use client"

import { UploadIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

/* ---------- Props ---------- */

interface ImportInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/* ---------- Component ---------- */

export function ImportInvoiceDialog({
  open,
  onOpenChange,
}: ImportInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Notas Fiscais</DialogTitle>
          <DialogDescription>
            Selecione um arquivo para importar as notas fiscais.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <UploadIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: PDF
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled>Importar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
