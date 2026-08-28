"use client"

import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  CreditCardIcon,
  ArrowRightIcon,
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
import { Badge } from "~/components/ui/badge"
import { SubscriptionsService, PlansService, ApiError } from "~/lib/api"
import type { Plan, PlanPrice, Subscription } from "~/lib/api/types"
import { SubscriptionPlan } from "./subscription-plan"
import { CancelDialog } from "./cancel-dialog"
import { useAuth } from "~/hooks/use-auth"

const LANGUAGE_CURRENCY = {
  pt_br: "BRL",
  en: "USD",
  es: "EUR",
} as const

function currencyForLanguage(language: string): string {
  const normalizedLanguage = language.replace("-", "_")
  return LANGUAGE_CURRENCY[normalizedLanguage as keyof typeof LANGUAGE_CURRENCY] ?? "USD"
}

export function SubscriptionPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const selectedCurrency = currencyForLanguage(i18n.language)

  // ──────────────────────────────────────────────────────────────
  // Admin-only gate: only users with profile "admin" can manage
  // billing and subscriptions for the account.
  // ──────────────────────────────────────────────────────────────
  const isAdmin = user?.profile === "admin"

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isStartingPriceId, setIsStartingPriceId] = useState<string | null>(null)
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [checkoutReturned, setCheckoutReturned] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [subRes, plansData] = await Promise.all([
        SubscriptionsService.get(),
        PlansService.list({ currency: selectedCurrency }),
      ])
      setSubscription(subRes.subscription)
      setPlans(plansData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(t("subscription.load-error"))
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedCurrency, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has("session_id")) return

    setCheckoutReturned(true)
    let attempts = 0
    const interval = window.setInterval(async () => {
      attempts += 1
      try {
        const result = await SubscriptionsService.get()
        if (result.subscription) {
          setSubscription(result.subscription)
          setCheckoutReturned(false)
          window.clearInterval(interval)
        }
      } catch {
        // The regular page refresh remains available if the webhook is delayed.
      }

      if (attempts >= 5) window.clearInterval(interval)
    }, 1500)
    window.history.replaceState({}, "", window.location.pathname)
    return () => window.clearInterval(interval)
  }, [])

  // --- Redirect to Stripe Checkout ---
  const handleStartSubscription = async (planPriceId: string) => {
    const successUrl = `${window.location.origin}/subscription`
    const cancelUrl = `${window.location.origin}/subscription`

    try {
      setIsStartingPriceId(planPriceId)
      const res = await SubscriptionsService.createCheckout({
        plan_price_id: planPriceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      })
      window.location.href = res.checkout_url
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error(t("subscription.checkout-error"))
      }
    } finally {
      setIsStartingPriceId(null)
    }
  }

  const handleChangePlan = async (planPriceId: string) => {
    setIsChangingPlan(true)
    try {
      const result = await SubscriptionsService.update({ plan_price_id: planPriceId })
      setSubscription(result.subscription)
      toast.success("Plano atualizado com sucesso.")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao trocar de plano.")
    } finally {
      setIsChangingPlan(false)
    }
  }

  // --- Cancel subscription ---
  const handleCancel = async () => {
    setIsCanceling(true)
    try {
      const result = await SubscriptionsService.cancel()
      setSubscription(result.subscription)
      toast.success("Assinatura cancelada. O acesso foi encerrado.")
      setCancelDialogOpen(false)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message)
      } else {
        toast.error(t("subscription.cancel-error"))
      }
    } finally {
      setIsCanceling(false)
    }
  }

  // --- Open Stripe Customer Portal ---
  const handleManageBilling = () => {
    SubscriptionsService.createPortal(`${window.location.origin}/subscription`)
      .then(({ portal_url }) => {
        window.location.href = portal_url
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          toast.error(err.message)
        } else {
          toast.error(t("subscription.checkout-error"))
        }
      })
  }

  // --- Admin-only gate ---
  if (!isAdmin) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertTriangleIcon className="size-8 text-destructive" />
                <p className="font-medium text-destructive">
                  {t("subscription.admin-only")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.admin-only-description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">{t("subscription.loading")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={fetchData}>
                  {t("subscription.retry")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="flex flex-col gap-1 px-4 lg:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("subscription.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("subscription.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex flex-col gap-5">
              {checkoutReturned && !subscription && (
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="pt-4 text-sm text-muted-foreground">
                    Seu pagamento foi recebido. Estamos confirmando sua assinatura; esta página será atualizada automaticamente.
                  </CardContent>
                </Card>
              )}
              {subscription ? (
                <>
                  <SubscriptionPlan
                    subscription={subscription}
                    plans={plans}
                    onChangePlan={handleChangePlan}
                    isChangingPlan={isChangingPlan}
                  />
                </>
              ) : (
                <>
                  {/* No subscription — show plan selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("subscription.no-subscription")}
                      </CardTitle>
                      <CardDescription>
                        {t("subscription.choose-plan-cta")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {plans.map((plan) => (
                        <PlanOption
                          key={plan.id}
                          plan={plan}
                          isStartingPriceId={isStartingPriceId}
                          onStart={handleStartSubscription}
                          startLabel={t("subscription.start")}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <aside className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    {t("subscription.billing-summary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {subscription ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("subscription.plan")}
                        </span>
                        <span className="font-medium">
                          {subscription.plan.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("subscription.amount")}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            subscription.price.amount,
                            subscription.price.currency,
                          )}
                          /{subscription.price.interval === "month"
                            ? t("plans.month")
                            : t("plans.year")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("subscription.seats")}
                        </span>
                        <span>{subscription.quantity}</span>
                      </div>
                      {subscription.current_period_end && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t("subscription.renews")}
                          </span>
                          <span>
                            {new Date(
                              subscription.current_period_end,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("subscription.no-active-plan")}
                    </p>
                  )}
                </CardContent>
                {subscription && (
                  <CardFooter className="flex flex-col items-stretch gap-2 border-t">
                    <Button variant="outline" onClick={handleManageBilling}>
                      <CreditCardIcon data-icon="inline-start" />
                      {t("subscription.manage-payment")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      {t("subscription.cancel")}
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {/* Past due alert */}
              {subscription?.status === "past_due" && (
                <Card className="border-destructive">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <AlertTriangleIcon className="size-5 shrink-0 text-destructive" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">
                        {t("subscription.past-due-title")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("subscription.past-due-description")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <CancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancel}
        isCanceling={isCanceling}
      />
    </div>
  )
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount)
}

function PlanOption({
  plan,
  isStartingPriceId,
  onStart,
  startLabel,
}: {
  plan: Plan
  isStartingPriceId: string | null
  onStart: (priceId: string) => void
  startLabel: string
}) {
  const prices = [...plan.prices].sort((a, b) => a.amount - b.amount)
  if (prices.length === 0) return null

  return (
    <Card className="h-full gap-5 border-border/70 bg-muted/20 transition-colors hover:bg-muted/40">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{plan.name}</CardTitle>
          {plan.trial_days > 0 && (
            <Badge variant="outline" className="shrink-0">
              {plan.trial_days} dias de teste
            </Badge>
          )}
        </div>
        {plan.description && (
          <CardDescription className="text-sm">{plan.description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="mt-auto flex flex-col items-stretch gap-2">
        {prices.map((price) => (
          <PriceStartButton
            key={price.id}
            price={price}
            isStarting={isStartingPriceId !== null}
            onStart={onStart}
            startLabel={startLabel}
          />
        ))}
      </CardFooter>
    </Card>
  )
}

function PriceStartButton({
  price,
  isStarting,
  onStart,
  startLabel,
}: {
  price: PlanPrice
  isStarting: boolean
  onStart: (priceId: string) => void
  startLabel: string
}) {
  const interval = price.interval === "month" ? "mês" : "ano"

  return (
    <Button
      className="w-full justify-between"
      disabled={isStarting}
      onClick={() => onStart(price.id)}
    >
      {isStarting
        ? "Abrindo checkout..."
        : `${startLabel} · ${formatCurrency(price.amount, price.currency)}/${interval}`}
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}
