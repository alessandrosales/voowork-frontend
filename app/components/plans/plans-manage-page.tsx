"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  PlusIcon,
  PencilIcon,
  BanIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  SelectGroup,
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
  CurrencyInput,
  isCurrencyCode,
  type CurrencyCode,
} from "~/components/shared/currency-input"
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
  currency: CurrencyCode
  country_code: string
  interval: "month" | "year"
  unit_amount_cents: number | null
  active: boolean
}

const COUNTRY_CODES = [
  "BR",
  "US",
  "CA",
  "MX",
  "AR",
  "CL",
  "CO",
  "PT",
  "ES",
  "GB",
  "DE",
  "FR",
  "IT",
] as const

const NO_COUNTRY_VALUE = "__NO_COUNTRY__"

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

  const availableCountryCodes =
    priceForm.country_code &&
    !COUNTRY_CODES.includes(
      priceForm.country_code as (typeof COUNTRY_CODES)[number]
    )
      ? [priceForm.country_code, ...COUNTRY_CODES]
      : COUNTRY_CODES
  const selectedCountryValue = priceForm.country_code || NO_COUNTRY_VALUE

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [priceToDelete, setPriceToDelete] = useState<{
    planSlug: string
    price: PlanPrice
  } | null>(null)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await PlansService.listForManagement()
      setPlans(data)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError(t("plans.load-error"))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

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
      await PlansService.update(planToDelete.slug, { plan: { active: false } })
      toast.success(t("plans-manage.deactivated"))
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
      currency: isCurrencyCode(price.currency) ? price.currency : "USD",
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
      const pricePayload = {
        ...priceForm,
        unit_amount_cents: priceForm.unit_amount_cents ?? 0,
      }

      if (editingPrice) {
        await PlanPricesService.update(pricePlanSlug, editingPrice.id, {
          plan_price: pricePayload,
        })
        toast.success(t("plans-manage.price-updated"))
      } else {
        await PlanPricesService.create(pricePlanSlug, {
          plan_price: pricePayload,
        })
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
      await PlanPricesService.update(priceToDelete.planSlug, priceToDelete.price.id, {
        plan_price: { active: false },
      })
      toast.success(t("plans-manage.price-deactivated"))
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
              <p className="font-medium text-destructive">
                {t("plans-manage.admin-only")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("plans-manage.admin-only-description")}
              </p>
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
        <Button variant="outline" onClick={fetchPlans}>
          {t("plans.retry")}
        </Button>
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
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("plans-manage.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("plans-manage.subtitle")}
              </p>
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
                        {plan.active
                          ? t("plans-manage.active")
                          : t("plans-manage.inactive")}
                      </Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreatePrice(plan.slug)}
                    >
                      <PlusIcon className="size-4" />
                      {t("plans-manage.add-price")}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => openEditPlan(plan)}
                      aria-label={t("plans-manage.edit-plan")}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => confirmDeletePlan(plan)}
                      aria-label={t("plans-manage.confirm-delete-btn")}
                    >
                      <BanIcon className="size-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.prices.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {t("plans-manage.no-prices")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {plan.prices.map((price) => (
                        <Card key={price.id} size="sm" className="h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-col gap-1">
                                <CardTitle className="text-2xl font-semibold tracking-tight">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: price.currency,
                                  }).format(price.amount)}
                                </CardTitle>
                                <CardDescription>
                                  {price.interval === "month"
                                    ? t("plans.monthly")
                                    : t("plans.yearly")}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={price.active ? "default" : "secondary"}
                              >
                                {price.active
                                  ? t("plans-manage.active")
                                  : t("plans-manage.inactive")}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col gap-2">
                            <div className="flex items-center justify-between gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {t("plans-manage.currency")}
                              </span>
                              <span className="font-medium">
                                {price.currency}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {t("plans-manage.country")}
                              </span>
                              <span className="font-medium">
                                {price.country_code || "—"}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="justify-end gap-1 border-t">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditPrice(plan.slug, price)}
                              aria-label={t("plans-manage.edit-price")}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                confirmDeletePrice(plan.slug, price)
                              }
                              aria-label={t(
                                "plans-manage.confirm-delete-price"
                              )}
                            >
                              <BanIcon className="text-destructive" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
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
            <DialogTitle>
              {editingPlan
                ? t("plans-manage.edit-plan")
                : t("plans-manage.new-plan")}
            </DialogTitle>
            <DialogDescription>
              {t("plans-manage.plan-dialog-description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-slug">{t("plans-manage.slug")}</Label>
                <Input
                  id="plan-slug"
                  value={planForm.slug}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, slug: e.target.value })
                  }
                  disabled={!!editingPlan}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-name">{t("plans-manage.name")}</Label>
                <Input
                  id="plan-name"
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-desc">{t("plans-manage.description")}</Label>
              <Textarea
                id="plan-desc"
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-sort">
                  {t("plans-manage.sort-order")}
                </Label>
                <Input
                  id="plan-sort"
                  type="number"
                  value={planForm.sort_order}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      sort_order: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-trial">
                  {t("plans-manage.trial-days")}
                </Label>
                <Input
                  id="plan-trial"
                  type="number"
                  value={planForm.trial_days}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      trial_days: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex items-end space-y-2 pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="plan-active"
                    checked={planForm.active}
                    onCheckedChange={(v: boolean) =>
                      setPlanForm({ ...planForm, active: v })
                    }
                  />
                  <Label htmlFor="plan-active">
                    {t("plans-manage.active")}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
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
            <DialogTitle>
              {editingPrice
                ? t("plans-manage.edit-price")
                : t("plans-manage.new-price")}
            </DialogTitle>
            <DialogDescription>
              {t("plans-manage.price-dialog-description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price-stripe-id">
                {t("plans-manage.stripe-price-id")}
              </Label>
              <Input
                id="price-stripe-id"
                value={priceForm.stripe_price_id}
                onChange={(e) =>
                  setPriceForm({
                    ...priceForm,
                    stripe_price_id: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price-currency">
                  {t("plans-manage.currency")}
                </Label>
                <Select
                  value={priceForm.currency}
                  onValueChange={(v: string) =>
                    setPriceForm({
                      ...priceForm,
                      currency: isCurrencyCode(v) ? v : priceForm.currency,
                    })
                  }
                >
                  <SelectTrigger id="price-currency" className="w-full">
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
                <Label htmlFor="price-interval">
                  {t("plans-manage.interval")}
                </Label>
                <Select
                  value={priceForm.interval}
                  onValueChange={(v: string) =>
                    setPriceForm({
                      ...priceForm,
                      interval: v as "month" | "year",
                    })
                  }
                >
                  <SelectTrigger id="price-interval" className="w-full">
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
                <Label htmlFor="price-amount">
                  {t("plans-manage.amount-cents")}
                </Label>
                <CurrencyInput
                  id="price-amount"
                  value={priceForm.unit_amount_cents}
                  currency={priceForm.currency}
                  onChange={(unit_amount_cents) =>
                    setPriceForm({
                      ...priceForm,
                      unit_amount_cents,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-country">
                  {t("plans-manage.country-code")}
                </Label>
                <Select
                  value={selectedCountryValue}
                  onValueChange={(value) =>
                    setPriceForm({
                      ...priceForm,
                      country_code: value === NO_COUNTRY_VALUE ? "" : value,
                    })
                  }
                >
                  <SelectTrigger id="price-country" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={NO_COUNTRY_VALUE}>
                        {t("plans-manage.no-country")}
                      </SelectItem>
                      {availableCountryCodes.map((countryCode) => (
                        <SelectItem key={countryCode} value={countryCode}>
                          {countryCode}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="price-active"
                checked={priceForm.active}
                onCheckedChange={(v: boolean) =>
                  setPriceForm({ ...priceForm, active: v })
                }
              />
              <Label htmlFor="price-active">{t("plans-manage.active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
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
            <AlertDialogCancel
              onClick={() => {
                setPlanToDelete(null)
                setPriceToDelete(null)
              }}
            >
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
