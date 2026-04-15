# ZEUS OPS - Full Stack Application

## Architecture

```
zeus-ops-platform/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/       # Shared components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React contexts
│   │   ├── services/        # API services
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
├── backend/                  # Express + PostgreSQL
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   └── database/            # Migrations, seeds
└── shared/                   # Shared types/constants
```

## Features Delivered

### Phase 1: Backend Infrastructure
- [x] Express server with middleware
- [x] PostgreSQL database with Sequelize ORM
- [x] JWT authentication system
- [x] RESTful API endpoints
- [x] Email service (SendGrid)
- [x] File upload (AWS S3)

### Phase 2: Frontend Application
- [x] Multi-page React Router setup
- [x] Authentication (login/register)
- [x] Landing page with animations
- [x] Pricing page
- [x] Case studies page
- [x] Blog/Content page

### Phase 3: CRM & Booking System
- [x] Lead capture forms
- [x] Contact management
- [x] Pipeline tracking
- [x] Calendar booking (Calendly API)
- [x] Email sequences
- [x] Task management

### Phase 4: Admin Dashboard
- [x] Zeus Operator dashboard
- [x] Client management
- [x] Analytics & reporting
- [x] Team workload view
- [x] Billing management

### Phase 5: Enhanced UX
- [x] Testimonials carousel
- [x] Smooth scroll animations
- [x] Interactive pricing calculator
- [x] Live chat widget
- [x] Social proof notifications

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/zeusops

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=hello@zeusops.com

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET_NAME=zeusops-assets

# Calendly
CALENDLY_API_KEY=xxx
CALENDLY_EVENT_UUID=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Frontend URL
CLIENT_URL=http://localhost:5173
```

## Database Schema

```sql
-- Users table
users (id, email, password_hash, role, first_name, last_name, company, created_at)

-- Leads table  
leads (id, email, first_name, last_name, company, phone, source, status, notes, assigned_to, created_at)

-- Contacts table
contacts (id, user_id, email, first_name, last_name, company, phone, tags, created_at)

-- Bookings table
bookings (id, lead_id, calendly_event_id, scheduled_at, status, notes, created_at)

-- Tasks table
tasks (id, user_id, title, description, status, priority, due_date, created_at)

-- Subscriptions table
subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)

-- Activity logs
activities (id, user_id, type, description, metadata, created_at)
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Leads
- GET /api/leads
- POST /api/leads
- GET /api/leads/:id
- PATCH /api/leads/:id
- DELETE /api/leads/:id

### Contacts
- GET /api/contacts
- POST /api/contacts
- GET /api/contacts/:id
- PATCH /api/contacts/:id
- DELETE /api/contacts/:id

### Bookings
- GET /api/bookings
- POST /api/bookings
- GET /api/bookings/availability

### Tasks
- GET /api/tasks
- POST /api/tasks
- PATCH /api/tasks/:id
- DELETE /api/tasks/:id

### Analytics
- GET /api/analytics/dashboard
- GET /api/analytics/leads
- GET /api/analytics/revenue

## Deployment

### Backend (Railway/Render)
```bash
cd backend
npm install
npm run migrate
npm start
```

### Frontend (Vercel)
```bash
cd frontend
npm install
npm run build
# Deploy dist/ folder
```
