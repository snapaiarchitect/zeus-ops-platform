# ZEUS OPS — Working Prototype

This is the build-complete prototype of the platform described in `README.md`, `DEPLOY.md` and `OPERATIONS.md`.
It runs end to end locally on SQLite with seeded **sample** data. Nothing in it talks to a third-party service.

## Run it

```bash
npm run install:all          # root + backend + frontend
cp backend/.env.example backend/.env    # then set JWT_SECRET (>= 32 chars)
npm run seed                 # (re)creates the SQLite DB with sample data
npm run dev                  # API on :3001, web app on :5173
```

| Role     | Login                      | Password             | Lands on     |
|----------|----------------------------|----------------------|--------------|
| Admin    | `admin@zeusops.test`       | `ZeusAdmin!2026`     | `/admin`     |
| Operator | `operator@zeusops.test`    | `ZeusOperator!2026`  | `/admin`     |
| Client   | `client@acme-demo.test`    | `ZeusClient!2026`    | `/dashboard` |

Sandbox only. Seed data is fictional (all `*-demo.test` companies). `npm run seed` wipes the database.

## What works (verified in a browser)

- **Public site**: landing, pricing (the three documented tiers), contact form → creates a CRM lead (de-duplicated by email, rate-limited), case studies, blog, about.
- **Auth**: register, login, role-based routing; clients cannot reach `/admin` or any CRM API (403).
- **Admin / operator**: overview, leads (Kanban drag-and-drop + list + create), contacts, bookings (calendar + create + status), tasks, analytics (real numbers, CSV export), team (real workload from tasks).
- **Client portal**: overview, task requests (create / update own only), billing (plan, hours used, invoices).
- **Security**: Stripe and Calendly webhooks fail *closed* (rejected unless a signing secret is configured and the signature verifies).

## What is NOT connected (and why)

| Integration | State |
|-------------|-------|
| Stripe      | Service layer present; needs `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`. Billing page shows a sandbox banner; plan changes / checkout return 501. |
| SendGrid    | Lead-notification and welcome emails are skipped (logged) until `SENDGRID_API_KEY` is set. |
| Calendly    | Webhook + API service present; needs `CALENDLY_API_KEY` + `CALENDLY_WEBHOOK_SECRET`. Bookings are managed in-app meanwhile. |
| Support tickets | The client Support page is still static UI (no ticket model or API yet). |
| Password reset email | Endpoint exists; delivery needs SendGrid. |

## Decisions needed before launch

1. **Marketing copy is placeholder.** About, Case Studies, Blog and team bios contain invented companies, people and results. `DEPLOY.md` lists real case studies / blog posts / testimonials as still-to-produce. These pages show a "sample content" banner (`SampleContentNotice`) — remove it when real content lands. Unsupported claims (SOC 2, uptime SLA, "500+ customers", press logos, funding) were removed from the landing, pricing and about pages.
2. **Frontend host**: `DEPLOY.md` says Vercel, `render.yaml` deploys a Render static site. `render.yaml` is now internally consistent (Render); if you use Vercel, add a `vercel.json` SPA rewrite and set `CLIENT_URL` accordingly.
3. **Schema changes**: the server creates missing tables on boot (`sequelize.sync()`, never alters/drops). Adopt real migrations before changing columns on a live database.
4. `src/services/activity.ts` and `notifications.ts` are leftover Prisma-based code with no callers; they are excluded from the build. Delete or port them.
