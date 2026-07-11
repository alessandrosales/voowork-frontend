"use client"

import * as React from "react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

import {
  CreatableInput,
  type CreatableField,
} from "~/components/shared/creatable-input"
import {
  InvoicesService,
  ProducersService,
  FarmsService,
  HarvestsService,
  UnitsService,
  ProductsService,
  CompaniesService,
  InvoiceTypesService,
  ApiError,
} from "~/lib/api"

import { schema } from "./invoices-table"

/* ---------- Props ---------- */

interface InvoiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingInvoice: z.infer<typeof schema> | null
  onSaved: () => void
}

/* ---------- Component ---------- */

export function InvoiceFormDialog({
  open,
  onOpenChange,
  editingInvoice,
  onSaved,
}: InvoiceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  // Relational fields
  const [formHarvest, setFormHarvest] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formProducer, setFormProducer] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formFarm, setFormFarm] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formCompany, setFormCompany] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formInvoiceType, setFormInvoiceType] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formSupplier, setFormSupplier] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formProduct, setFormProduct] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formUnit, setFormUnit] = React.useState<CreatableField>({
    name: "",
    selectedId: null,
  })
  const [formOriginInvoice, setFormOriginInvoice] = React.useState("")

  // Direct fields
  const [formNotaFiscal, setFormNotaFiscal] = React.useState("")
  const [formDataNF, setFormDataNF] = React.useState("")
  const [formQuantidade, setFormQuantidade] = React.useState("")
  const [formPrecoUnitario, setFormPrecoUnitario] = React.useState("")
  const [formValorTotal, setFormValorTotal] = React.useState("")
  const [formEntrega, setFormEntrega] = React.useState("")
  const [formObservacoes, setFormObservacoes] = React.useState("")

  /* ---------- Reset ---------- */

  const resetForm = React.useCallback(() => {
    setFormHarvest({ name: "", selectedId: null })
    setFormProducer({ name: "", selectedId: null })
    setFormFarm({ name: "", selectedId: null })
    setFormCompany({ name: "", selectedId: null })
    setFormInvoiceType({ name: "", selectedId: null })
    setFormSupplier({ name: "", selectedId: null })
    setFormProduct({ name: "", selectedId: null })
    setFormUnit({ name: "", selectedId: null })
    setFormOriginInvoice("")
    setFormNotaFiscal("")
    setFormDataNF("")
    setFormQuantidade("")
    setFormPrecoUnitario("")
    setFormValorTotal("")
    setFormEntrega("")
    setFormObservacoes("")
    setFormError(null)
    setIsSubmitting(false)
  }, [])

  /* ---------- Populate on edit ---------- */

  React.useEffect(() => {
    if (!open) return

    if (editingInvoice) {
      setFormHarvest({ name: editingInvoice.safra, selectedId: editingInvoice.harvest_id })
      setFormProducer({ name: editingInvoice.produtor, selectedId: editingInvoice.producer_id })
      setFormFarm({ name: editingInvoice.fazenda, selectedId: editingInvoice.farm_id })
      setFormCompany({ name: editingInvoice.empresa, selectedId: editingInvoice.company_id })
      setFormInvoiceType({ name: editingInvoice.tipo, selectedId: editingInvoice.type_id })
      setFormSupplier({ name: editingInvoice.fornecedor, selectedId: editingInvoice.supplier_id })
      setFormProduct({ name: editingInvoice.produto, selectedId: editingInvoice.product_id })
      setFormUnit({ name: editingInvoice.unidade, selectedId: editingInvoice.unit_id })
      setFormOriginInvoice(editingInvoice.nfOrigem)
      setFormNotaFiscal(editingInvoice.notaFiscal)
      setFormDataNF(editingInvoice.dataNF)
      setFormQuantidade(String(editingInvoice.quantidade))
      setFormPrecoUnitario(String(editingInvoice.precoUnitario))
      setFormValorTotal(String(editingInvoice.valorTotal))
      setFormEntrega(editingInvoice.entrega)
      setFormObservacoes(editingInvoice.observacoes)
      setFormError(null)
      setIsSubmitting(false)
    } else {
      resetForm()
    }
  }, [open, editingInvoice, resetForm])

  /* ---------- Ensure + Save ---------- */

  const ensure = async <T extends { id: string }>(
    field: CreatableField,
    createFn: (data: { name: string }) => Promise<T>,
  ): Promise<string> => {
    if (field.selectedId) return field.selectedId
    if (!field.name.trim()) return ""
    const created = await createFn({ name: field.name })
    return created.id
  }

  const handleSave = async () => {
    setFormError(null)
    setIsSubmitting(true)

    try {
      const [
        producerId,
        farmId,
        harvestId,
        unitId,
        productId,
        companyId,
        invoiceTypeId,
        supplierId,
      ] = await Promise.all([
        ensure(formProducer, ProducersService.create),
        ensure(formFarm, FarmsService.create),
        ensure(formHarvest, HarvestsService.create),
        ensure(formUnit, UnitsService.create),
        ensure(formProduct, ProductsService.create),
        ensure(formCompany, CompaniesService.create),
        ensure(formInvoiceType, InvoiceTypesService.create),
        ensure(formSupplier, CompaniesService.create),
      ])

      const payload: Record<string, unknown> = {
        number: formNotaFiscal,
        date: formDataNF,
        harvest_id: harvestId,
        producer_id: producerId,
        farm_id: farmId,
        company_id: companyId,
        type_id: invoiceTypeId,
        supplier_id: supplierId,
        product_id: productId,
        unit_id: unitId,
        quantity: Number(formQuantidade) || 0,
        unit_price: Number(formPrecoUnitario) || 0,
        total_value: Number(formValorTotal) || 0,
        origin_invoice_number: formOriginInvoice || null,
        ...(formEntrega ? { delivery: formEntrega } : {}),
        ...(formObservacoes ? { notes: formObservacoes } : {}),
      }

      if (editingInvoice) {
        await InvoicesService.update(editingInvoice.id, payload)
        toast.success("Nota fiscal atualizada com sucesso.")
      } else {
        await InvoicesService.create(
          payload as Parameters<typeof InvoicesService.create>[0],
        )
        toast.success("Nota fiscal criada com sucesso.")
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const msgs = Object.values(err.errors).flat()
          setFormError(msgs.join(". "))
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError("Erro de conexão.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ---------- Render ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingInvoice ? "Editar Nota Fiscal" : "Nova Nota Fiscal"}
          </DialogTitle>
          <DialogDescription>
            {editingInvoice
              ? "Altere os dados da nota fiscal selecionada."
              : "Preencha os dados para criar uma nova nota fiscal."}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <FieldGroup className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel>Safra</FieldLabel>
            <CreatableInput
              value={formHarvest}
              onChange={setFormHarvest}
              searchFn={HarvestsService.search}
              placeholder="Digite a safra..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Produtor</FieldLabel>
            <CreatableInput
              value={formProducer}
              onChange={setFormProducer}
              searchFn={ProducersService.search}
              placeholder="Digite o produtor..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Fazenda</FieldLabel>
            <CreatableInput
              value={formFarm}
              onChange={setFormFarm}
              searchFn={FarmsService.search}
              placeholder="Digite a fazenda..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="nfOrigem">NF Origem</FieldLabel>
            <Input
              id="nfOrigem"
              value={formOriginInvoice}
              onChange={(e) => setFormOriginInvoice(e.target.value)}
              placeholder="Número da NF de origem"
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Empresa</FieldLabel>
            <CreatableInput
              value={formCompany}
              onChange={setFormCompany}
              searchFn={CompaniesService.search}
              placeholder="Digite a empresa..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Tipo</FieldLabel>
            <CreatableInput
              value={formInvoiceType}
              onChange={setFormInvoiceType}
              searchFn={InvoiceTypesService.search}
              placeholder="Digite o tipo..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="notaFiscal">Nota Fiscal</FieldLabel>
            <Input
              id="notaFiscal"
              value={formNotaFiscal}
              onChange={(e) => setFormNotaFiscal(e.target.value)}
              placeholder="Número da NF"
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dataNF">Data NF</FieldLabel>
            <Input
              id="dataNF"
              type="date"
              value={formDataNF}
              onChange={(e) => setFormDataNF(e.target.value)}
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Fornecedor</FieldLabel>
            <CreatableInput
              value={formSupplier}
              onChange={setFormSupplier}
              searchFn={CompaniesService.search}
              placeholder="Digite o fornecedor..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Produto</FieldLabel>
            <CreatableInput
              value={formProduct}
              onChange={setFormProduct}
              searchFn={ProductsService.search}
              placeholder="Digite o produto..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel>Unidade</FieldLabel>
            <CreatableInput
              value={formUnit}
              onChange={setFormUnit}
              searchFn={UnitsService.search}
              placeholder="Digite a unidade..."
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="quantidade">Quantidade</FieldLabel>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              value={formQuantidade}
              onChange={(e) => setFormQuantidade(e.target.value)}
              onBlur={() => {
                const qty = Number(formQuantidade)
                const price = Number(formPrecoUnitario)
                if (qty > 0 && price > 0) {
                  setFormValorTotal(String(qty * price))
                }
              }}
              placeholder="0,00"
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="precoUnitario">
              Preço Unitário (R$)
            </FieldLabel>
            <Input
              id="precoUnitario"
              type="number"
              step="0.01"
              value={formPrecoUnitario}
              onChange={(e) => setFormPrecoUnitario(e.target.value)}
              onBlur={() => {
                const qty = Number(formQuantidade)
                const price = Number(formPrecoUnitario)
                if (qty > 0 && price > 0) {
                  setFormValorTotal(String(qty * price))
                }
              }}
              placeholder="0,00"
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="valorTotal">Valor Total (R$)</FieldLabel>
            <Input
              id="valorTotal"
              type="number"
              step="0.01"
              value={formValorTotal}
              onChange={(e) => setFormValorTotal(e.target.value)}
              placeholder="0,00"
              disabled={isSubmitting}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="entrega">Entrega</FieldLabel>
            <Input
              id="entrega"
              value={formEntrega}
              onChange={(e) => setFormEntrega(e.target.value)}
              placeholder="Status/data de entrega"
              disabled={isSubmitting}
            />
          </Field>
          <Field className="col-span-3">
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Input
              id="observacoes"
              value={formObservacoes}
              onChange={(e) => setFormObservacoes(e.target.value)}
              placeholder="Observações adicionais"
              disabled={isSubmitting}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : editingInvoice
                ? "Salvar"
                : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
