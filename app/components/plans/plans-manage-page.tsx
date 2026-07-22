"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { PlusIcon, PencilIcon, TrashIcon, AlertTriangleIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Switch } from "~/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Badge } from "~/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { PlansService, PlanPricesService, ApiError } from "~/lib/api"
import type { Plan, PlanPrice } from "~/lib/api/types"
import { useAuth } from "~/hooks/use-auth"

interface PlanFormData {
  slug: string
  name: string
  description: string
  sort_order: number
  active: boolean
  trial_days: number
  stripe_product_id: string
  features: Record<string, unknown>
}

interface PriceFormData {
  stripe_price_id: string
  currency: string
  country_code: string
  interval: "month" | "year"
  unit_amount_cents: number
  active: boolean
}

const emptyPlanForm = (): PlanFormData => ({
  slug: "",
  name: "",
  description: "",
  sort_order: 1,
  active: true,
  trial_days: 14,
  stripe_product_id: "",
  features: {},
})

const emptyPriceForm = (): PriceFormData => ({
  stripe_price_id: "",
  currency: "USD",
  country_code: "",
  interval: "month",
  unit_amount_cents: 0,
  active: true,
})

export function PlansManagePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const isAdmin = user?.profile === "admin"

  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Plan dialog state
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planForm, setPlanForm] = useState<PlanFormData>(emptyPlanForm())
  const [isSavingPlan, setIsSavingPlan] = useState(false)

  // Price dialog state
  const [priceDialogOpen, setPriceDialogOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<PlanPrice | null>(null)
  const [pricePlanSlug, setPricePlanSlug] = useState<string>("")
  const [priceForm, setPriceForm] = useState<PriceFormData>(emptyPriceForm())
  const [isSavingPrice, setIsSavingPrice] = useState(false)

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [priceToDelete, setPriceToDelete] = useState<{ planSlug: string; price: PlanPrice } | null>(null)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await PlansService.list()
      setPlans(data)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError(t("plans.load-error"))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  // ── Plan CRUD handlers ──────────────────────────────────────

  const openCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm(emptyPlanForm())
    setPlanDialogOpen(true)
  }

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      slug: plan.slug,
      name: plan.name,
      description: plan.description ?? "",
      sort_order: plan.sort_order,
      active: plan.active,
      trial_days: plan.trial_days,
      stripe_product_id: "",
      features: plan.features,
    })
    setPlanDialogOpen(true)
  }

  const savePlan = async () => {
    setIsSavingPlan(true)
    try {
      if (editingPlan) {
        await PlansService.update(editingPlan.slug, { plan: planForm })
        toast.success(t("plans-manage.updated"))
      } else {
        await PlansService.create({ plan: planForm })
        toast.success(t("plans-manage.created"))
      }
      setPlanDialogOpen(false)
      fetchPlans()
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message)
      else toast.error(t("plans-manage.save-error"))
    } finally {
      setIsSavingPlan(false)
    }
  }

  const confirmDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan)
    setPriceToDelete(null)
    setDeleteDialogOpen(true)
  }

  const executeDeletePlan = async () => {
    if (!planToDelete) return
    try {
      await PlansService.destroy(planToDelete.slug)
      toast.success(t("plans-manage.deleted"))
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
      fetchPlans()
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message)
      else toast.error(t("plans-manage.delete-error"))
    }
  }

  // ── Price CRUD handlers ─────────────────────────────────────

  const openCreatePrice = (planSlug: string) => {
    setEditingPrice(null)
    setPricePlanSlug(planSlug)
    setPriceForm(emptyPriceForm())
    setPriceDialogOpen(true)
  }

  const openEditPrice = (planSlug: string, price: PlanPrice) => {
    setEditingPrice(price)
    setPricePlanSlug(planSlug)
    setPriceForm({
      stripe_price_id: "",
      currency: price.currency,
      country_code: price.country_code ?? "",
      interval: price.interval,
      unit_amount_cents: price.unit_amount_cents,
      active: price.active,
    })
    setPriceDialogOpen(true)
  }

  const savePrice = async () => {
    setIsSavingPrice(true)
    try {
      if (editingPrice) {
        await PlanPricesService.update(pricePlanSlug, editingPrice.id, { plan_price: priceForm })
        toast.success(t("plans-manage.price-updated"))
      } else {
        await PlanPricesService.create(pricePlanSlug, { plan_price: priceForm })
        toast.success(t("plans-manage.price-created"))
      }
      setPriceDialogOpen(false)
      fetchPlans()
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message)
      else toast.error(t("plans-manage.save-error"))
    } finally {
      setIsSavingPrice(false)
    }
  }

  const confirmDeletePrice = (planSlug: string, price: PlanPrice) => {
    setPriceToDelete({ planSlug, price })
    setPlanToDelete(null)
    setDeleteDialogOpen(true)
  }

  const executeDeletePrice = async () => {
    if (!priceToDelete) return
    try {
      await PlanPricesService.destroy(priceToDelete.planSlug, priceToDelete.price.id)
      toast.success(t("plans-manage.price-deleted"))
      setDeleteDialogOpen(false)
      setPriceToDelete(null)
      fetchPlans()
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message)
      else toast.error(t("plans-manage.delete-error"))
    }
  }

  // ── Admin-only gate ─────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangleIcon className="size-8 text-destructive" />
              <p className="font-medium text-destructive">{t("plans-manage.admin-only")}</p>
              <p className="text-sm text-muted-foreground">{t("plans-manage.admin-only-description")}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">{t("plans.loading")}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={fetchPlans}>{t("plans.retry")}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">{t("plans-manage.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("plans-manage.subtitle")}</p>
            </div>
            <Button onClick={openCreatePlan}>
              <PlusIcon />
              {t("plans-manage.new-plan")}
            </Button>
          </div>

          {/* Plans list */}
          <div className="space-y-6 px-4 lg:px-6">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Badge variant={plan.active ? "default" : "secondary"}>
                        {plan.active ? t("plans-manage.active") : t("plans-manage.inactive")}
                      </Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openCreatePrice(plan.slug)}>
                      <PlusIcon className="size-4" />
                      {t("plans-manage.add-price")}
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => openEditPlan(plan)}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon-sm" onClick={() => confirmDeletePlan(plan)}>
                      <TrashIcon className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Prices table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("plans-manage.currency")}</TableHead>
                        <TableHead>{t("plans-manage.country")}</TableHead>
                        <TableHead>{t("plans-manage.interval")}</TableHead>
                        <TableHead>{t("plans-manage.amount")}</TableHead>
                        <TableHead>{t("plans-manage.active-col")}</TableHead>
                        <TableHead className="w-20" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.prices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {t("plans-manage.no-prices")}
                          </TableCell>
                        </TableRow>
                      )}
                      {plan.prices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell>{price.currency}</TableCell>
                          <TableCell>{price.country_code || "—"}</TableCell>
                          <TableCell>{price.interval === "month" ? t("plans.monthly") : t("plans.yearly")}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: price.currency }).format(price.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={price.active ? "default" : "secondary"}>
                              {price.active ? t("plans-manage.active") : t("plans-manage.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditPrice(plan.slug, price)}>
                                <PencilIcon className="size-3" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDeletePrice(plan.slug, price)}>
                                <TrashIcon className="size-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── Plan Dialog ─────────────────────────────────────── */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? t("plans-manage.edit-plan") : t("plans-manage.new-plan")}</DialogTitle>
            <DialogDescription>{t("plans-manage.plan-dialog-description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-slug">{t("plans-manage.slug")}</Label>
                <Input id="plan-slug" value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                       disabled={!!editingPlan} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-name">{t("plans-manage.name")}</Label>
                <Input id="plan-name" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-desc">{t("plans-manage.description")}</Label>
              <Textarea id="plan-desc" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-sort">{t("plans-manage.sort-order")}</Label>
                <Input id="plan-sort" type="number" value={planForm.sort_order}
                       onChange={(e) => setPlanForm({ ...planForm, sort_order: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-trial">{t("plans-manage.trial-days")}</Label>
                <Input id="plan-trial" type="number" value={planForm.trial_days}
                       onChange={(e) => setPlanForm({ ...planForm, trial_days: Number(e.target.value) })} />
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Switch id="plan-active" checked={planForm.active}
                          onCheckedChange={(v: boolean) => setPlanForm({ ...planForm, active: v })} />
                  <Label htmlFor="plan-active">{t("plans-manage.active")}</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={savePlan} disabled={isSavingPlan}>
              {isSavingPlan ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Price Dialog ────────────────────────────────────── */}
      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPrice ? t("plans-manage.edit-price") : t("plans-manage.new-price")}</DialogTitle>
            <DialogDescription>{t("plans-manage.price-dialog-description")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price-stripe-id">{t("plans-manage.stripe-price-id")}</Label>
              <Input id="price-stripe-id" value={priceForm.stripe_price_id}
                     onChange={(e) => setPriceForm({ ...priceForm, stripe_price_id: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("plans-manage.currency")}</Label>
                <Select value={priceForm.currency} onValueChange={(v: string) => setPriceForm({ ...priceForm, currency: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("plans-manage.interval")}</Label>
                <Select value={priceForm.interval} onValueChange={(v: string) => setPriceForm({ ...priceForm, interval: v as "month" | "year" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">{t("plans.monthly")}</SelectItem>
                    <SelectItem value="year">{t("plans.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price-amount">{t("plans-manage.amount-cents")}</Label>
                <Input id="price-amount" type="number" value={priceForm.unit_amount_cents}
                       onChange={(e) => setPriceForm({ ...priceForm, unit_amount_cents: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-country">{t("plans-manage.country-code")}</Label>
                <Input id="price-country" value={priceForm.country_code}
                       onChange={(e) => setPriceForm({ ...priceForm, country_code: e.target.value })} placeholder="e.g. US, BR" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="price-active" checked={priceForm.active}
                      onCheckedChange={(v: boolean) => setPriceForm({ ...priceForm, active: v })} />
              <Label htmlFor="price-active">{t("plans-manage.active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={savePrice} disabled={isSavingPrice}>
              {isSavingPrice ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {planToDelete
                ? t("plans-manage.confirm-delete", { name: planToDelete.name })
                : t("plans-manage.confirm-delete-price")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {planToDelete
                ? t("plans-manage.delete-plan-warning")
                : t("plans-manage.delete-price-warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPlanToDelete(null); setPriceToDelete(null) }}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={planToDelete ? executeDeletePlan : executeDeletePrice}
            >
              {t("plans-manage.confirm-delete-btn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
