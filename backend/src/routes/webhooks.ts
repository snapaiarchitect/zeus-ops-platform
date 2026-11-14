import { Router } from 'express';
import crypto from 'crypto';
import { Lead, Contact, Booking, Activity } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { constructWebhookEvent } from '../services/stripe.js';

const router = Router();

// Stripe webhook handler
router.post(
  '/stripe',
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];

    // Fail closed: never process payment events we cannot authenticate.
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: 'Stripe webhooks are not configured' });
    }
    if (typeof sig !== 'string' || !(req as any).rawBody) {
      return res.status(400).json({ error: 'Stripe signature missing' });
    }

    let event: any;
    try {
      event = constructWebhookEvent((req as any).rawBody, sig);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid Stripe signature' });
    }

    if (!event || !event.type) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          
          // Extract customer info
          const customerEmail = session.customer_email || session.customer_details?.email;
          const customerName = session.customer_details?.name;
          const metadata = session.metadata || {};

          // Create or update lead
          if (customerEmail) {
            const [firstName, lastName] = customerName 
              ? customerName.split(' ').filter(Boolean)
              : ['', ''];

            const [lead, created] = await Lead.findOrCreate({
              where: { email: customerEmail },
              defaults: {
                email: customerEmail,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                source: 'stripe_payment',
                status: 'qualified',
                priority: 'high',
                estimatedValue: session.amount_total ? session.amount_total / 100 : 0,
                notes: `Payment completed via Stripe. Session ID: ${session.id}`
              }
            });

            if (!created) {
              // Update existing lead
              await lead.update({
                status: 'qualified',
                priority: 'high',
                notes: lead.notes 
                  ? `${lead.notes}\nPayment completed: ${session.id}`
                  : `Payment completed: ${session.id}`
              });
            }

            // Log activity
            await Activity.create({
              type: 'lead_created',
              description: `Lead created/updated from Stripe payment: ${customerEmail}`,
              entityType: 'lead',
              entityId: lead.id,
              metadata: {
                stripeSessionId: session.id,
                amount: session.amount_total,
                currency: session.currency,
                createdFromWebhook: true
              }
            });
          }

          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const customerEmail = invoice.customer_email;

          if (customerEmail) {
            // Find existing lead/contact and update
            const lead = await Lead.findOne({ where: { email: customerEmail } });
            
            if (lead) {
              await lead.update({
                status: 'closed_won',
                notes: lead.notes 
                  ? `${lead.notes}\nInvoice paid: ${invoice.id}`
                  : `Invoice paid: ${invoice.id}`
              });
            }

            await Activity.create({
              type: 'lead_updated',
              description: `Payment succeeded for ${customerEmail}`,
              entityType: 'lead',
              entityId: lead?.id,
              metadata: {
                invoiceId: invoice.id,
                amount: invoice.amount_paid,
                status: invoice.status
              }
            });
          }

          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const customerId = subscription.customer;

          console.log(`[Stripe] Subscription ${event.type}: ${subscription.id} for customer ${customerId}`);

          // Log subscription event
          await Activity.create({
            type: 'status_changed',
            description: `Subscription ${subscription.status}: ${subscription.id}`,
            metadata: {
              subscriptionId: subscription.id,
              customerId,
              status: subscription.status,
              planId: subscription.items?.data?.[0]?.plan?.id,
              amount: subscription.items?.data?.[0]?.plan?.amount
            }
          });

          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;

          await Activity.create({
            type: 'status_changed',
            description: `Subscription cancelled: ${subscription.id}`,
            metadata: {
              subscriptionId: subscription.id,
              customerId: subscription.customer,
              cancelledAt: subscription.canceled_at
            }
          });

          break;
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }

      // Return 200 to acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error('[Stripe Webhook] Error processing event:', error);
      // Still return 200 to prevent Stripe from retrying
      // Log the error internally
      res.json({ received: true, error: 'Processing error logged' });
    }
  })
);

// Calendly webhook handler
router.post(
  '/calendly',
  asyncHandler(async (req, res) => {
    // Fail closed: verify the Calendly signature ("t=<ts>,v1=<hmac>") before touching any data.
    const secret = process.env.CALENDLY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(503).json({ error: 'Calendly webhooks are not configured' });
    }
    const header = req.headers['calendly-webhook-signature'];
    const parts = Object.fromEntries(
      String(header || '').split(',').map((kv) => kv.trim().split('=') as [string, string])
    );
    const rawBody: Buffer | undefined = (req as any).rawBody;
    if (!parts.t || !parts.v1 || !rawBody) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody.toString('utf8')}`).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(String(parts.v1));
    const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < 300; // 5-minute replay window
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b) || !fresh) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (!event || !event.event) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    console.log(`[Calendly Webhook] Received event: ${event.event}`);

    try {
      const eventType = event.event;
      const payload = event.payload;

      switch (eventType) {
        case 'invitee.created': {
          const invitee = payload?.invitee;
          const eventInfo = payload?.event_type;

          if (!invitee) {
            console.error('[Calendly Webhook] Missing invitee data');
            break;
          }

          const email = invitee.email;
          const name = invitee.name || '';
          const [firstName, lastName] = name.split(' ').filter(Boolean);
          const scheduledTime = payload?.event?.start_time;
          const timezone = invitee.timezone || 'America/New_York';
          const duration = eventInfo?.duration || 30;
          const meetingUrl = payload?.event?.location?.join_url || '';

          // Create or find lead
          const [lead, leadCreated] = await Lead.findOrCreate({
            where: { email },
            defaults: {
              email,
              firstName: firstName || undefined,
              lastName: lastName || undefined,
              source: 'calendly',
              status: 'contacted',
              priority: 'medium',
              notes: `Booking scheduled via Calendly: ${eventInfo?.name || 'Discovery Call'}`
            }
          });

          // Create booking record
          const booking = await Booking.create({
            leadId: lead.id,
            calendlyEventId: payload?.event?.uuid,
            calendlyInviteeId: invitee.uuid,
            eventType: mapCalendlyEventType(eventInfo?.name),
            scheduledAt: new Date(scheduledTime),
            timezone,
            duration,
            status: 'scheduled',
            meetingUrl,
            notes: `Questions: ${invitee.questions_and_answers?.map((qa: any) => `${qa.question}: ${qa.answer}`).join('\n') || 'None'}`
          });

          // Update lead
          if (!leadCreated) {
            await lead.update({
              status: 'contacted',
              lastContactedAt: new Date(),
              nextFollowUpAt: new Date(scheduledTime)
            });
          }

          // Log activity
          await Activity.create({
            type: 'booking_scheduled',
            description: `Booking scheduled via Calendly: ${name} (${email})`,
            entityType: 'booking',
            entityId: booking.id,
            metadata: {
              calendlyEventId: payload?.event?.uuid,
              scheduledTime,
              eventType: eventInfo?.name,
              duration
            }
          });

          console.log(`[Calendly] Created booking for ${email} at ${scheduledTime}`);
          break;
        }

        case 'invitee.canceled': {
          const invitee = payload?.invitee;
          const cancelReason = invitee?.cancel_reason || 'No reason provided';
          const cancelTime = invitee?.canceled_at;

          // Find and update booking
          const booking = await Booking.findOne({
            where: { calendlyInviteeId: invitee?.uuid }
          });

          if (booking) {
            await booking.update({
              status: 'cancelled',
              notes: `${booking.notes || ''}\n\nCancelled at ${cancelTime}. Reason: ${cancelReason}`
            });

            await Activity.create({
              type: 'status_changed',
              description: `Booking cancelled: ${invitee?.email || 'Unknown'}`,
              entityType: 'booking',
              entityId: booking.id,
              metadata: {
                reason: cancelReason,
                cancelledAt: cancelTime
              }
            });
          }

          break;
        }

        case 'invitee.no_show': {
          const invitee = payload?.invitee;

          const booking = await Booking.findOne({
            where: { calendlyInviteeId: invitee?.uuid }
          });

          if (booking) {
            await booking.update({
              status: 'no_show'
            });

            await Activity.create({
              type: 'status_changed',
              description: `Booking marked as no-show: ${invitee?.email || 'Unknown'}`,
              entityType: 'booking',
              entityId: booking.id,
              metadata: { noShow: true }
            });
          }

          break;
        }

        default:
          console.log(`[Calendly Webhook] Unhandled event type: ${eventType}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('[Calendly Webhook] Error processing event:', error);
      // Return 200 to prevent retries, but log the error
      res.json({ received: true, error: 'Processing error logged' });
    }
  })
);

// Helper function to map Calendly event names to internal event types
function mapCalendlyEventType(eventName: string = ''): 'discovery' | 'strategy' | 'demo' | 'consultation' | 'check_in' {
  const name = eventName.toLowerCase();
  
  if (name.includes('strategy')) return 'strategy';
  if (name.includes('demo')) return 'demo';
  if (name.includes('consultation')) return 'consultation';
  if (name.includes('check') || name.includes('follow')) return 'check_in';
  
  return 'discovery';
}

export default router;
