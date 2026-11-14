import { Router } from 'express';
import { Subscription } from '../models/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { getInvoices } from '../services/stripe.js';

const router = Router();

// Service tiers — mirrors DEPLOY.md / OPERATIONS.md
export const PLANS = [
  { id: 'pilot', name: 'Pilot', price: 2500, hours: 25, features: ['25 hrs/mo AI ops support', '1 discovery call/mo', 'Email support (24h)', 'Weekly status reports'] },
  { id: 'growth', name: 'Growth', price: 5000, hours: 50, features: ['50 hrs/mo', '2 strategy calls/mo', 'Slack/Teams channel', 'Priority support (4h)', 'Custom AI tooling'] },
  { id: 'enterprise', name: 'Enterprise', price: 15000, hours: 150, features: ['150 hrs/mo (dedicated team)', 'Daily standups', 'Dedicated Slack channel', 'Quarterly business reviews'] },
];

const stripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);

// GET / - Current user's subscription, plans and invoices
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const subscription = await Subscription.findOne({ where: { userId: req.user!.id } });
    let invoices: unknown[] = [];
    if (subscription && stripeConfigured()) {
      try {
        invoices = await getInvoices(subscription.stripeCustomerId, 12);
      } catch (err) {
        console.error('Failed to load Stripe invoices:', err);
      }
    }
    res.json({ subscription, plans: PLANS, invoices, stripeConfigured: stripeConfigured() });
  })
);

// POST /checkout - Start a plan change. Requires live Stripe keys.
router.post(
  '/checkout',
  authenticate,
  asyncHandler(async (_req: AuthRequest, _res) => {
    if (!stripeConfigured()) {
      throw new AppError('Payments are not enabled in this environment (Stripe is not configured).', 501);
    }
    throw new AppError('Checkout flow requires a configured Stripe price per plan.', 501);
  })
);

export default router;
