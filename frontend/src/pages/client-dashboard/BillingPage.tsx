import { useEffect, useState } from 'react'
import { Download, Zap, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { billingService, type BillingOverview } from '@/services/billing.service'
import { tasksService } from '@/services/tasks.service'
import { useToast } from '@/components/ui/Toast'

const money = (n: number, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

export function ClientBillingPage() {
  const { toast } = useToast()
  const [billing, setBilling] = useState<BillingOverview | null>(null)
  const [hoursUsed, setHoursUsed] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [overview, tasks] = await Promise.all([billingService.getOverview(), tasksService.getMyTasks()])
        setBilling(overview)
        setHoursUsed(tasks.reduce((sum, t) => sum + Number(t.actualHours || 0), 0))
      } catch (error) {
        console.error('Failed to load billing:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  const sub = billing?.subscription
  const plan = billing?.plans.find((p) => p.id === sub?.plan)
  const usedPct = plan ? Math.min(100, Math.round((hoursUsed / plan.hours) * 100)) : 0

  const paymentsUnavailable = () =>
    toast({
      variant: 'default',
      title: 'Not available in the sandbox',
      children: 'Plan changes and payment methods are handled by Stripe, which is not connected in this environment.',
    } as never)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400">Your ZEUS OPS engagement, plan and invoices</p>
      </div>

      {!billing?.stripeConfigured && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Sandbox mode: Stripe is not connected, so invoices, payment methods and plan changes are disabled.
            Plan details below come from the database.
          </p>
        </div>
      )}

      {/* Current plan */}
      {sub && plan ? (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {plan.name} plan <span className="ml-2 text-xs uppercase tracking-wide text-cyan-300">{sub.status}</span>
                </h2>
                <p className="text-slate-400">{money(Number(sub.amount), sub.currency)}/month</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plan.features.map((f) => (
                    <span key={f} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{f}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-slate-400 text-sm">{sub.cancelAtPeriodEnd ? 'Ends on' : 'Next billing date'}</p>
              <p className="text-white font-medium">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={paymentsUnavailable}>
                Change plan
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-slate-300">
          You don't have an active plan yet. Pick a tier below to get started.
        </div>
      )}

      {/* Hours */}
      {plan && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Hours this period</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Logged against your requests</span>
            <span className="text-white">{hoursUsed} / {plan.hours} hrs</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-1">{usedPct}% of included hours</p>
        </div>
      )}

      {/* Invoices */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Invoice history</h2>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {billing?.invoices.length ? (
            <div className="divide-y divide-slate-800">
              {billing.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-white font-medium">{new Date(inv.created * 1000).toLocaleDateString()}</p>
                    <p className="text-slate-400 text-sm capitalize">{inv.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{money(inv.amountDue / 100, inv.currency)}</p>
                    {inv.pdfUrl && (
                      <a href={inv.pdfUrl} className="inline-flex items-center gap-1 text-xs text-cyan-400 mt-1">
                        <Download className="w-3 h-3" /> PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-slate-400">No invoices to show.</p>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Available plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {billing?.plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-5 ${p.id === sub?.plan ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/50'}`}
            >
              <h3 className="text-white font-semibold">{p.name}</h3>
              <p className="text-2xl font-bold text-white mt-1">{money(p.price)}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
              <p className="text-slate-400 text-sm">{p.hours} hours / month</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                {p.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              {p.id !== sub?.plan && (
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={paymentsUnavailable}>
                  Switch to {p.name}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
