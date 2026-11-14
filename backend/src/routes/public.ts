import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { Lead, Testimonial, User, Activity } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendLeadNotification } from '../services/email.js';

const router = Router();

// Public form: tight limit to blunt spam
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 500,
  message: { error: 'Too many submissions, please try again later' },
});

// POST /leads - Contact / "book a call" form on the marketing site
router.post(
  '/leads',
  formLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name is required'),
    body('company').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
    body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
    body('message').optional({ values: 'falsy' }).trim().isLength({ max: 4000 }),
    body('interest').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { email, name, company, phone, message, interest } = req.body;
    const [firstName, ...rest] = String(name).trim().split(/\s+/);
    const lastName = rest.join(' ') || undefined;
    const note = [interest && `Interested in: ${interest}`, message].filter(Boolean).join('\n\n');

    // Never reveal whether an email already exists; append to the existing lead instead.
    const existing = await Lead.findOne({ where: { email } });
    let lead = existing;
    if (existing) {
      await existing.update({ notes: [existing.notes, `[${new Date().toISOString()}] ${note}`].filter(Boolean).join('\n\n') });
    } else {
      lead = await Lead.create({ email, firstName, lastName, company, phone, source: 'website', status: 'new', priority: 'medium', notes: note || undefined, tags: ['website-form'] });
      await Activity.create({ type: 'lead_created', description: `Website lead: ${company || email}`, entityType: 'lead', entityId: lead.id });
      const admins = await User.findAll({ where: { role: 'admin', isActive: true } });
      for (const admin of admins) {
        sendLeadNotification(lead, admin).catch((err) => console.error('Lead notification failed:', err));
      }
    }
    res.status(201).json({ message: "Thanks — we'll be in touch within one business day." });
  })
);

// GET /testimonials - Featured testimonials for the marketing site
router.get(
  '/testimonials',
  asyncHandler(async (_req, res) => {
    const testimonials = await Testimonial.findAll({ where: { isActive: true }, order: [['displayOrder', 'ASC']] });
    res.json({ testimonials });
  })
);

export default router;
