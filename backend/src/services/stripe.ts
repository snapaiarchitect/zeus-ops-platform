import Stripe from 'stripe';
import { User, Subscription, Invoice } from '../types';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });
}

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

const defaultRetry: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = defaultRetry,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const stripeError = error as Stripe.errors.StripeError;
    if (stripeError.type === 'StripeRateLimitError' && attempt < config.maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, config.delayMs * attempt));
      return withRetry(fn, config, attempt + 1);
    }
    throw error;
  }
}

export interface CreateCustomerResult {
  id: string;
  email: string;
  name?: string;
}

export async function createCustomer(user: User): Promise<CreateCustomerResult> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const customer = await withRetry(() =>
    stripe!.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    })
  );

  return {
    id: customer.id,
    email: customer.email!,
    name: customer.name || undefined,
  };
}

export interface CreateSubscriptionResult {
  id: string;
  status: Stripe.Subscription.Status;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  clientSecret?: string;
}

export async function createSubscription(
  customerId: string,
  plan: 'starter' | 'growth' | 'scale'
): Promise<CreateSubscriptionResult> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const priceIds: Record<string, string> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID || '',
    growth: process.env.STRIPE_GROWTH_PRICE_ID || '',
    scale: process.env.STRIPE_SCALE_PRICE_ID || '',
  };

  const priceId = priceIds[plan];
  if (!priceId) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const subscription = await withRetry(() =>
    stripe!.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      collection_method: 'charge_automatically',
      expand: ['latest_invoice.payment_intent'],
    })
  );

  const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent;

  return {
    id: subscription.id,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    clientSecret: paymentIntent?.client_secret || undefined,
  };
}

export interface CancelSubscriptionResult {
  id: string;
  status: Stripe.Subscription.Status;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number;
}

export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false
): Promise<CancelSubscriptionResult> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  if (immediate) {
    const subscription = await withRetry(() =>
      stripe!.subscriptions.cancel(subscriptionId)
    );
    return {
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    };
  } else {
    const subscription = await withRetry(() =>
      stripe!.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    );
    return {
      id: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end,
    };
  }
}

export async function reactivateSubscription(
  subscriptionId: string
): Promise<CancelSubscriptionResult> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await withRetry(() =>
    stripe!.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
  );

  return {
    id: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: subscription.current_period_end,
  };
}

export interface WebhookEvent {
  type: string;
  data: {
    object: unknown;
  };
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): WebhookEvent {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    throw new Error('Stripe webhook not configured');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_WEBHOOK_SECRET
  ) as WebhookEvent;
}

export async function handleWebhook(event: WebhookEvent): Promise<void> {
  const { type, data } = event;
  const object = data.object as Stripe.Subscription | Stripe.Invoice | Stripe.PaymentIntent;

  switch (type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', object.id);
      break;

    case 'customer.subscription.updated':
      console.log('Subscription updated:', object.id);
      break;

    case 'customer.subscription.deleted':
      console.log('Subscription deleted:', object.id);
      break;

    case 'invoice.payment_succeeded':
      console.log('Invoice payment succeeded:', object.id);
      break;

    case 'invoice.payment_failed':
      console.log('Invoice payment failed:', object.id);
      break;

    case 'payment_intent.succeeded':
      console.log('Payment intent succeeded:', object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment intent failed:', object.id);
      break;

    default:
      console.log(`Unhandled event type: ${type}`);
  }
}

export interface InvoiceData {
  id: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: Stripe.Invoice.Status;
  created: number;
  periodStart: number;
  periodEnd: number;
  pdfUrl?: string;
}

export async function getInvoices(
  customerId: string,
  limit: number = 10
): Promise<InvoiceData[]> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const invoices = await withRetry(() =>
    stripe!.invoices.list({
      customer: customerId,
      limit,
    })
  );

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status,
    created: invoice.created,
    periodStart: invoice.period_start,
    periodEnd: invoice.period_end,
    pdfUrl: invoice.invoice_pdf || undefined,
  }));
}

export async function getUpcomingInvoice(customerId: string): Promise<InvoiceData | null> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const invoice = await withRetry(() =>
      stripe!.invoices.retrieveUpcoming({
        customer: customerId,
      })
    );

    return {
      id: invoice.id,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: 'draft',
      created: invoice.created,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
    };
  } catch (error) {
    if ((error as Stripe.errors.StripeError).code === 'invoice_upcoming_none') {
      return null;
    }
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: { priceId?: string; prorationDate?: number }
): Promise<CreateSubscriptionResult> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const subscription = await withRetry(() => {
    const params: Stripe.SubscriptionUpdateParams = {};
    if (updates.priceId) {
      params.items = [{ price: updates.priceId }];
    }
    if (updates.prorationDate) {
      params.proration_date = updates.prorationDate;
    }
    params.proration_behavior = 'create_prorations';

    return stripe!.subscriptions.update(subscriptionId, params);
  });

  return {
    id: subscription.id,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
  };
}

export async function createPaymentIntent(
  amount: number,
  currency: string,
  customerId: string,
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; id: string }> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const paymentIntent = await withRetry(() =>
    stripe!.paymentIntents.create({
      amount: amount * 100,
      currency,
      customer: customerId,
      metadata,
      automatic_payment_methods: { enabled: true },
    })
  );

  return {
    clientSecret: paymentIntent.client_secret!,
    id: paymentIntent.id,
  };
}
