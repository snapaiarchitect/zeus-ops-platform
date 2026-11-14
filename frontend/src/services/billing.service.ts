import { api } from './api'

export interface Plan { id: string; name: string; price: number; hours: number; features: string[] }
export interface BillingSubscription {
  plan: string; status: string; amount: number; currency: string
  currentPeriodStart: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean
}
export interface BillingInvoice { id: string; amountDue: number; amountPaid: number; currency: string; status: string | null; created: number; pdfUrl?: string }
export interface BillingOverview {
  subscription: BillingSubscription | null
  plans: Plan[]
  invoices: BillingInvoice[]
  stripeConfigured: boolean
}

export const billingService = {
  async getOverview(): Promise<BillingOverview> {
    const { data } = await api.get<BillingOverview>('/billing')
    return data
  },
}
