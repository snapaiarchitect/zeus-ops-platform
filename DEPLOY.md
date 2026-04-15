# ZEUS OPS - Deployment & Launch Guide

## Quick Start (5 minutes to live)

### 1. Environment Setup

Create `.env` files:

**Backend (`backend/.env`)**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/zeusops
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# SendGrid
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=hello@zeusops.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Calendly
CALENDLY_API_KEY=xxx
CALENDLY_EVENT_UUID=xxx

# Frontend URL
CLIENT_URL=https://zeusops.com
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=https://api.zeusops.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 2. Database Setup (Railway/Render/Neon)

```bash
cd backend
npm install
npm run migrate
npm run seed  # Optional: add sample data
```

### 3. Backend Deployment (Railway/Render)

**Railway:**
1. Connect GitHub repo
2. Set environment variables
3. Deploy

**Render:**
1. Create new Web Service
2. Connect repo, set root to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`

### 4. Frontend Deployment (Vercel)

```bash
cd frontend
npm install
npm run build
# Deploy dist/ folder to Vercel
```

**Vercel Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Add all VITE_* vars

---

## Launch Checklist

### Pre-Launch (Week -1)
- [ ] SSL certificate configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Stripe webhook endpoint configured
- [ ] Calendly webhook endpoint configured
- [ ] SendGrid sender domain verified
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics (Google Analytics 4) configured

### Launch Day (Week 0)
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Test authentication flow
- [ ] Test payment flow ($1 test transaction)
- [ ] Test booking flow
- [ ] Test contact forms
- [ ] Verify email delivery
- [ ] Run Lighthouse audit (target: 90+)

### Post-Launch (Week 1-4)
- [ ] Monitor error logs daily
- [ ] Track signup conversion rate
- [ ] Track booking conversion rate
- [ ] Collect user feedback
- [ ] Optimize based on data
- [ ] Content marketing (blog posts)
- [ ] LinkedIn outreach campaign
- [ ] Case study development

---

## Pricing Tiers

| Tier | Price | Hours | Best For |
|------|-------|-------|----------|
| **Pilot** | $2,500/mo | 25 hrs/mo | Testing AI ops, small projects |
| **Growth** | $5,000/mo | 50 hrs/mo | Ongoing implementation |
| **Enterprise** | $15,000/mo | 150 hrs/mo | Full fractional AI team |

---

## Marketing Assets Needed

### Website Content
- [ ] 3 detailed case studies
- [ ] 6 blog posts (AI implementation guides)
- [ ] FAQ section (20+ questions)
- [ ] Testimonials (5+ with photos)

### Sales Materials
- [ ] One-pager PDF
- [ ] Proposal template
- [ ] Discovery call script
- [ ] Pricing calculator

### Outreach
- [ ] LinkedIn content calendar (30 days)
- [ ] Cold email sequence (5 emails)
- [ ] Follow-up templates
- [ ] Referral program

---

## Success Metrics (KPIs)

### Month 1 Targets
- Website visitors: 1,000
- Signups: 50
- Discovery calls booked: 10
- Pilot clients closed: 3
- Revenue: $7,500

### Month 3 Targets
- Website visitors: 5,000
- Signups: 200
- Active clients: 10
- MRR: $25,000
- Case studies published: 3

### Month 6 Targets
- Website visitors: 15,000
- Active clients: 20
- MRR: $75,000
- Team size: 3 operators
- NPS score: 50+

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT + bcrypt |
| Payments | Stripe |
| Email | SendGrid |
| Calendar | Calendly API |
| Hosting | Railway (backend) + Vercel (frontend) |
| Monitoring | Sentry + Google Analytics |

---

## Support & Maintenance

### Daily
- Check error logs (Sentry)
- Review support tickets
- Monitor conversion funnels

### Weekly
- Team sync meeting
- Client check-ins
- Content publishing
- LinkedIn engagement

### Monthly
- Financial review
- Churn analysis
- Feature prioritization
- Security updates

---

*Last updated: April 2026*