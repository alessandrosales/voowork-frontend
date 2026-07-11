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
import { Field, FieldGroup, FieldLabel, FieldError } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

import {
  CreatableInput,
  type CreatableField,
} from "~/components/shared/creatable-input"
import { DatePickerInput } from "~/components/shared/date-picker-input"
import { CurrencyInput } from "~/components/shared/currency-input"
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

/* ---------- Form State ---------- */

interface InvoiceFormState {
  harvest: CreatableField
  producer: CreatableField
  farm: CreatableField
  company: CreatableField
  invoiceType: CreatableField
  supplier: CreatableField
  product: CreatableField
  unit: CreatableField
  originInvoice: string
  notaFiscal: string
  dataNF: string
  quantidade: string
  precoUnitario: string
  valorTotal: string
  entrega: string
  observacoes: string
}

type InvoiceFormAction =
  | { type: "SET_FIELD"; field: Exclude<keyof InvoiceFormState, "harvest" | "producer" | "farm" | "company" | "invoiceType" | "supplier" | "product" | "unit">; value: string }
  | { type: "SET_CREATABLE"; field: "harvest" | "producer" | "farm" | "company" | "invoiceType" | "supplier" | "product" | "unit"; value: CreatableField }
  | { type: "RESET" }
  | { type: "POPULATE"; invoice: z.infer<typeof schema> }

const creatableInitial: CreatableField = { name: "", selectedId: null }

const initialFormState: InvoiceFormState = {
  harvest: { ...creatableInitial },
  producer: { ...creatableInitial },
  farm: { ...creatableInitial },
  company: { ...creatableInitial },
  invoiceType: { ...creatableInitial },
  supplier: { ...creatableInitial },
  product: { ...creatableInitial },
  unit: { ...creatableInitial },
  originInvoice: "",
  notaFiscal: "",
  dataNF: "",
  quantidade: "",
  precoUnitario: "",
  valorTotal: "",
  entrega: "",
  observacoes: "",
}

function formReducer(state: InvoiceFormState, action: InvoiceFormAction): InvoiceFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }
    case "SET_CREATABLE":
      return { ...state, [action.field]: action.value }
    case "RESET":
      return initialFormState
    case "POPULATE":
      return {
        harvest: { name: action.invoice.safra, selectedId: action.invoice.harvest_id },
        producer: { name: action.invoice.produtor, selectedId: action.invoice.producer_id },
        farm: { name: action.invoice.fazenda, selectedId: action.invoice.farm_id },
        company: { name: action.invoice.empresa, selectedId: action.invoice.company_id },
        invoiceType: { name: action.invoice.tipo, selectedId: action.invoice.type_id },
        supplier: { name: action.invoice.fornecedor, selectedId: action.invoice.supplier_id },
        product: { name: action.invoice.produto, selectedId: action.invoice.product_id },
        unit: { name: action.invoice.unidade, selectedId: action.invoice.unit_id },
        originInvoice: action.invoice.nfOrigem,
        notaFiscal: action.invoice.notaFiscal,
        dataNF: action.invoice.dataNF,
        quantidade: String(action.invoice.quantidade),
        precoUnitario: String(action.invoice.precoUnitario),
        valorTotal: String(action.invoice.valorTotal),
        entrega: action.invoice.entrega,
        observacoes: action.invoice.observacoes,
      }
    default:
      return state
  }
}

/* ---------- Validation ---------- */

interface FormErrors {
  harvest?: string
  producer?: string
  farm?: string
  company?: string
  invoiceType?: string
  notaFiscal?: string
  dataNF?: string
  supplier?: string
  product?: string
  unit?: string
  quantidade?: string
  precoUnitario?: string
  valorTotal?: string
}

function validateForm(state: InvoiceFormState): FormErrors | null {
  const errors: FormErrors = {}

  // Campos relacionais obrigatórios (devem ter um ID selecionado ou criado via overlay)
  if (!state.harvest.selectedId) {
    errors.harvest = "Safra é obrigatória. Selecione ou crie uma."
  }
  if (!state.producer.selectedId) {
    errors.producer = "Produtor é obrigatório. Selecione ou crie um."
  }
  if (!state.farm.selectedId) {
    errors.farm = "Fazenda é obrigatória. Selecione ou crie uma."
  }
  if (!state.company.selectedId) {
    errors.company = "Empresa é obrigatória. Selecione ou crie uma."
  }
  if (!state.invoiceType.selectedId) {
    errors.invoiceType = "Tipo é obrigatório. Selecione ou crie um."
  }
  if (!state.supplier.selectedId) {
    errors.supplier = "Fornecedor é obrigatório. Selecione ou crie um."
  }
  if (!state.product.selectedId) {
    errors.product = "Produto é obrigatório. Selecione ou crie um."
  }
  if (!state.unit.selectedId) {
    errors.unit = "Unidade é obrigatória. Selecione ou crie uma."
  }

  // Campos diretos obrigatórios
  if (!state.notaFiscal.trim()) {
    errors.notaFiscal = "Nota fiscal é obrigatória."
  }
  if (!state.dataNF.trim()) {
    errors.dataNF = "Data da NF é obrigatória."
  }
  const qty = Number(state.quantidade)
  if (!state.quantidade.trim() || isNaN(qty) || qty <= 0) {
    errors.quantidade = "Quantidade deve ser maior que zero."
  }
  const price = Number(state.precoUnitario)
  if (!state.precoUnitario.trim() || isNaN(price) || price <= 0) {
    errors.precoUnitario = "Preço unitário deve ser maior que zero."
  }
  const total = Number(state.valorTotal)
  if (!state.valorTotal.trim() || isNaN(total) || total <= 0) {
    errors.valorTotal = "Valor total deve ser maior que zero."
  }

  return Object.keys(errors).length > 0 ? errors : null
}

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
  const [form, dispatch] = React.useReducer(formReducer, initialFormState)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<FormErrors | null>(null)
  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false)
  const [quickCreateField, setQuickCreateField] = React.useState<
    "harvest" | "producer" | "farm" | "company" | "invoiceType" | "supplier" | "product" | "unit" | null
  >(null)
  const [quickCreateName, setQuickCreateName] = React.useState("")
  const [quickCreateLoading, setQuickCreateLoading] = React.useState(false)

  /* ---------- Reset ---------- */

  const resetForm = React.useCallback(() => {
    dispatch({ type: "RESET" })
    setFormError(null)
    setFieldErrors(null)
    setIsSubmitting(false)
  }, [])

  /* ---------- Populate on edit ---------- */

  React.useEffect(() => {
    if (!open) return
    setFieldErrors(null)

    if (editingInvoice) {
      dispatch({ type: "POPULATE", invoice: editingInvoice })
      setFormError(null)
      setIsSubmitting(false)
    } else {
      resetForm()
    }
  }, [open, editingInvoice, resetForm])

  /* ---------- Save ---------- */

  const handleSave = async () => {
    setFormError(null)
    setFieldErrors(null)

    // Validação dos campos
    const errors = validateForm(form)
    if (errors) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        number: form.notaFiscal,
        date: form.dataNF,
        harvest_id: form.harvest.selectedId,
        producer_id: form.producer.selectedId,
        farm_id: form.farm.selectedId,
        company_id: form.company.selectedId,
        type_id: form.invoiceType.selectedId,
        supplier_id: form.supplier.selectedId,
        product_id: form.product.selectedId,
        unit_id: form.unit.selectedId,
        quantity: Number(form.quantidade) || 0,
        unit_price: Number(form.precoUnitario) || 0,
        total_value: Number(form.valorTotal) || 0,
        origin_invoice_number: form.originInvoice || null,
        ...(form.entrega ? { delivery: form.entrega } : {}),
        ...(form.observacoes ? { notes: form.observacoes } : {}),
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
        className="sm:max-w-4xl max-h-[85vh] overflow-y-auto"
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

        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field data-invalid={!!fieldErrors?.harvest}>
            <FieldLabel>Safra</FieldLabel>
            <CreatableInput
              id="harvest"
              value={form.harvest}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "harvest", value: val })}
              searchFn={HarvestsService.search}
              placeholder="Digite a safra..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.harvest}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("harvest")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.harvest && <FieldError>{fieldErrors.harvest}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.producer}>
            <FieldLabel>Produtor</FieldLabel>
            <CreatableInput
              id="producer"
              value={form.producer}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "producer", value: val })}
              searchFn={ProducersService.search}
              placeholder="Digite o produtor..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.producer}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("producer")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.producer && <FieldError>{fieldErrors.producer}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.farm}>
            <FieldLabel>Fazenda</FieldLabel>
            <CreatableInput
              id="farm"
              value={form.farm}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "farm", value: val })}
              searchFn={FarmsService.search}
              placeholder="Digite a fazenda..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.farm}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("farm")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.farm && <FieldError>{fieldErrors.farm}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="nfOrigem">NF Origem</FieldLabel>
            <Input
              id="nfOrigem"
              value={form.originInvoice}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "originInvoice", value: e.target.value })}
              placeholder="Número da NF de origem"
              disabled={isSubmitting}
            />
          </Field>
          <Field data-invalid={!!fieldErrors?.company}>
            <FieldLabel>Empresa</FieldLabel>
            <CreatableInput
              id="company"
              value={form.company}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "company", value: val })}
              searchFn={CompaniesService.search}
              placeholder="Digite a empresa..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.company}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("company")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.company && <FieldError>{fieldErrors.company}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.invoiceType}>
            <FieldLabel>Tipo</FieldLabel>
            <CreatableInput
              id="invoiceType"
              value={form.invoiceType}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "invoiceType", value: val })}
              searchFn={InvoiceTypesService.search}
              placeholder="Digite o tipo..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.invoiceType}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("invoiceType")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.invoiceType && <FieldError>{fieldErrors.invoiceType}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.notaFiscal}>
            <FieldLabel htmlFor="notaFiscal">Nota Fiscal</FieldLabel>
            <Input
              id="notaFiscal"
              value={form.notaFiscal}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "notaFiscal", value: e.target.value })}
              placeholder="Número da NF"
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors?.notaFiscal || undefined}
            />
            {fieldErrors?.notaFiscal && (
              <FieldError>{fieldErrors.notaFiscal}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!fieldErrors?.dataNF}>
            <FieldLabel>Data NF</FieldLabel>
            <DatePickerInput
              id="dataNF"
              value={form.dataNF}
              onChange={(val) => dispatch({ type: "SET_FIELD", field: "dataNF", value: val })}
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.dataNF}
            />
            {fieldErrors?.dataNF && (
              <FieldError>{fieldErrors.dataNF}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!fieldErrors?.supplier}>
            <FieldLabel>Fornecedor</FieldLabel>
            <CreatableInput
              id="supplier"
              value={form.supplier}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "supplier", value: val })}
              searchFn={CompaniesService.search}
              placeholder="Digite o fornecedor..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.supplier}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("supplier")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.supplier && <FieldError>{fieldErrors.supplier}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.product}>
            <FieldLabel>Produto</FieldLabel>
            <CreatableInput
              id="product"
              value={form.product}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "product", value: val })}
              searchFn={ProductsService.search}
              placeholder="Digite o produto..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.product}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("product")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.product && <FieldError>{fieldErrors.product}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.unit}>
            <FieldLabel>Unidade</FieldLabel>
            <CreatableInput
              id="unit"
              value={form.unit}
              onChange={(val) => dispatch({ type: "SET_CREATABLE", field: "unit", value: val })}
              searchFn={UnitsService.search}
              placeholder="Digite a unidade..."
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.unit}
              onAdd={() => {
                setQuickCreateName("")
                setQuickCreateField("unit")
                setQuickCreateOpen(true)
              }}
            />
            {fieldErrors?.unit && <FieldError>{fieldErrors.unit}</FieldError>}
          </Field>
          <Field data-invalid={!!fieldErrors?.quantidade}>
            <FieldLabel htmlFor="quantidade">Quantidade</FieldLabel>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              value={form.quantidade}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "quantidade", value: e.target.value })}
              onBlur={() => {
                const qty = Number(form.quantidade)
                const price = Number(form.precoUnitario)
                if (qty > 0 && price > 0) {
                  dispatch({ type: "SET_FIELD", field: "valorTotal", value: String(qty * price) })
                }
              }}
              placeholder="0,00"
              disabled={isSubmitting}
              aria-invalid={!!fieldErrors?.quantidade || undefined}
            />
            {fieldErrors?.quantidade && (
              <FieldError>{fieldErrors.quantidade}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!fieldErrors?.precoUnitario}>
            <FieldLabel htmlFor="precoUnitario">
              Preço Unitário
            </FieldLabel>
            <CurrencyInput
              id="precoUnitario"
              value={form.precoUnitario}
              onChange={(val) => dispatch({ type: "SET_FIELD", field: "precoUnitario", value: val })}
              onBlur={() => {
                const qty = Number(form.quantidade)
                const price = Number(form.precoUnitario)
                if (qty > 0 && price > 0) {
                  dispatch({ type: "SET_FIELD", field: "valorTotal", value: String(qty * price) })
                }
              }}
              placeholder="0,00"
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.precoUnitario}
            />
            {fieldErrors?.precoUnitario && (
              <FieldError>{fieldErrors.precoUnitario}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!fieldErrors?.valorTotal}>
            <FieldLabel htmlFor="valorTotal">Valor Total</FieldLabel>
            <CurrencyInput
              id="valorTotal"
              value={form.valorTotal}
              onChange={(val) => dispatch({ type: "SET_FIELD", field: "valorTotal", value: val })}
              placeholder="0,00"
              disabled={isSubmitting}
              ariaInvalid={!!fieldErrors?.valorTotal}
            />
            {fieldErrors?.valorTotal && (
              <FieldError>{fieldErrors.valorTotal}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="entrega">Entrega</FieldLabel>
            <Input
              id="entrega"
              value={form.entrega}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "entrega", value: e.target.value })}
              placeholder="Status/data de entrega"
              disabled={isSubmitting}
            />
          </Field>
          <Field className="md:col-span-2 lg:col-span-3">
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea
              id="observacoes"
              value={form.observacoes}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "observacoes", value: e.target.value })}
              placeholder="Observações adicionais"
              disabled={isSubmitting}
            />
          </Field>
          </div>
        </FieldGroup>

        {/* Overlay de criação rápida */}
        {quickCreateOpen && quickCreateField && (
          <div className="absolute inset-0 z-50 flex items-start justify-center bg-background/80 pt-12">
            <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
              <h3 className="mb-1 text-lg font-semibold">
                {quickCreateField === "harvest" && "Nova Safra"}
                {quickCreateField === "producer" && "Novo Produtor"}
                {quickCreateField === "farm" && "Nova Fazenda"}
                {quickCreateField === "company" && "Nova Empresa"}
                {quickCreateField === "invoiceType" && "Novo Tipo"}
                {quickCreateField === "supplier" && "Novo Fornecedor"}
                {quickCreateField === "product" && "Novo Produto"}
                {quickCreateField === "unit" && "Nova Unidade"}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Digite o nome para adicioná-lo.
              </p>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="quickCreateName">Nome</FieldLabel>
                  <Input
                    id="quickCreateName"
                    value={quickCreateName}
                    onChange={(e) => setQuickCreateName(e.target.value)}
                    placeholder="Digite o nome..."
                    disabled={quickCreateLoading}
                    autoFocus
                  />
                </Field>
              </FieldGroup>
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuickCreateOpen(false)
                    setQuickCreateName("")
                    setQuickCreateField(null)
                  }}
                  disabled={quickCreateLoading}
                >
                  Cancelar
                </Button>
                <Button
                  disabled={!quickCreateName.trim() || quickCreateLoading}
                  onClick={async () => {
                    if (!quickCreateName.trim() || !quickCreateField) return
                    setQuickCreateLoading(true)
                    try {
                      let created: { id: string; name: string }
                      switch (quickCreateField) {
                        case "harvest":
                          created = await HarvestsService.create({ name: quickCreateName.trim() })
                          break
                        case "producer":
                          created = await ProducersService.create({ name: quickCreateName.trim() })
                          break
                        case "farm":
                          created = await FarmsService.create({ name: quickCreateName.trim() })
                          break
                        case "company":
                          created = await CompaniesService.create({ name: quickCreateName.trim() })
                          break
                        case "invoiceType":
                          created = await InvoiceTypesService.create({ name: quickCreateName.trim() })
                          break
                        case "supplier":
                          created = await CompaniesService.create({ name: quickCreateName.trim() })
                          break
                        case "product":
                          created = await ProductsService.create({ name: quickCreateName.trim() })
                          break
                        case "unit":
                          created = await UnitsService.create({ name: quickCreateName.trim() })
                          break
                      }
                      dispatch({
                        type: "SET_CREATABLE",
                        field: quickCreateField,
                        value: { name: created.name, selectedId: created.id },
                      })
                      toast.success(`${created.name} adicionado com sucesso.`)
                      setQuickCreateOpen(false)
                      setQuickCreateName("")
                      setQuickCreateField(null)
                    } catch (err) {
                      if (err instanceof ApiError) {
                        toast.error(err.message || "Erro ao criar.")
                      } else {
                        toast.error("Erro de conexão.")
                      }
                    } finally {
                      setQuickCreateLoading(false)
                    }
                  }}
                >
                  {quickCreateLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        )}

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
