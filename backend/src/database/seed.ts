import { sequelize } from './index.js';
import { User, Lead, Contact, Booking, Task, Activity, Subscription, Testimonial } from '../models/index.js';

// SAMPLE DATA ONLY — every person/company below is fictional.
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);

await sequelize.sync({ force: true });

const admin = await User.create({ email: 'admin@zeusops.test', password: 'ZeusAdmin!2026', role: 'admin', firstName: 'Zeus', lastName: 'Operator', company: 'ZEUS OPS', isActive: true });
const op = await User.create({ email: 'operator@zeusops.test', password: 'ZeusOperator!2026', role: 'operator', firstName: 'Orion', lastName: 'Hale', company: 'ZEUS OPS', isActive: true });
const client = await User.create({ email: 'client@acme-demo.test', password: 'ZeusClient!2026', role: 'client', firstName: 'Casey', lastName: 'Rivera', company: 'Acme Demo Co', isActive: true });

const leadData: Array<[string, string, string, string, Lead['status'], number, Lead['priority'], string]> = [
  ['jordan@northwind-demo.test', 'Jordan', 'Lee', 'Northwind Demo', 'new', 5000, 'medium', 'website'],
  ['sam@contoso-demo.test', 'Sam', 'Patel', 'Contoso Demo', 'contacted', 7500, 'medium', 'linkedin'],
  ['alex@globex-demo.test', 'Alex', 'Kim', 'Globex Demo', 'qualified', 15000, 'high', 'referral'],
  ['riley@initech-demo.test', 'Riley', 'Chen', 'Initech Demo', 'proposal', 30000, 'high', 'website'],
  ['taylor@umbrella-demo.test', 'Taylor', 'Brooks', 'Umbrella Demo', 'negotiation', 60000, 'high', 'linkedin'],
  ['morgan@hooli-demo.test', 'Morgan', 'Diaz', 'Hooli Demo', 'closed_won', 30000, 'high', 'referral'],
  ['drew@piedpiper-demo.test', 'Drew', 'Singh', 'Pied Piper Demo', 'closed_won', 60000, 'medium', 'website'],
  ['jamie@vandelay-demo.test', 'Jamie', 'Ortiz', 'Vandelay Demo', 'closed_lost', 5000, 'low', 'cold_email'],
  ['quinn@stark-demo.test', 'Quinn', 'Adams', 'Stark Demo', 'new', 15000, 'medium', 'website'],
  ['avery@wayne-demo.test', 'Avery', 'Nguyen', 'Wayne Demo', 'contacted', 30000, 'medium', 'cold_email'],
];
const leads = [];
for (const [i, l] of leadData.entries()) {
  leads.push(await Lead.create({
    email: l[0], firstName: l[1], lastName: l[2], company: l[3], status: l[4], estimatedValue: l[5], priority: l[6], source: l[7],
    assignedTo: i % 2 ? op.id : admin.id, tags: ['sample'], nextFollowUpAt: daysFromNow(i - 2), notes: 'Sample lead for prototype review.',
  }));
}

for (const l of leads.slice(2, 8)) {
  await Contact.create({
    userId: admin.id, email: l.email, firstName: l.firstName, lastName: l.lastName, company: l.company, jobTitle: 'VP Operations',
    tags: ['sample'], isClient: l.status === 'closed_won', clientSince: l.status === 'closed_won' ? daysFromNow(-60) : undefined,
    lifetimeValue: l.status === 'closed_won' ? l.estimatedValue : undefined, lastInteractionAt: daysFromNow(-3),
  });
}

const types: Booking['eventType'][] = ['discovery', 'strategy', 'demo', 'consultation', 'check_in'];
for (const [i, l] of leads.slice(0, 6).entries()) {
  await Booking.create({
    leadId: l.id, eventType: types[i % types.length], scheduledAt: daysFromNow(i - 1), timezone: 'America/New_York', duration: 30,
    status: i < 1 ? 'completed' : 'scheduled', followUpRequired: i % 2 === 0, notes: 'Sample booking',
  });
}

const tasks: Array<[string, Task['status'], Task['priority'], Task['category']]> = [
  ['Prepare AI opportunity assessment — Globex Demo', 'in_progress', 'high', 'client_work'],
  ['Send proposal to Initech Demo', 'todo', 'urgent', 'business_dev'],
  ['Weekly status report — Acme Demo Co', 'todo', 'medium', 'client_work'],
  ['Publish blog post: AI ops playbook', 'review', 'low', 'internal'],
  ['Reconcile Stripe payouts', 'done', 'medium', 'admin'],
  ['Follow up with Umbrella Demo on contract', 'blocked', 'high', 'business_dev'],
];
for (const [i, t] of tasks.entries()) {
  await Task.create({
    userId: admin.id, assignedTo: i % 2 ? op.id : admin.id, clientId: client.id, title: t[0], status: t[1], priority: t[2], category: t[3],
    dueDate: daysFromNow(i + 1), estimatedHours: 2 + i, tags: [], attachments: [], completedAt: t[1] === 'done' ? new Date() : undefined,
  });
}

await Subscription.create({
  userId: client.id, stripeCustomerId: 'cus_SAMPLE', stripeSubscriptionId: 'sub_SAMPLE', plan: 'growth', status: 'active',
  currentPeriodStart: daysFromNow(-10), currentPeriodEnd: daysFromNow(20), cancelAtPeriodEnd: false, amount: 5000, currency: 'usd',
});

const testimonials = [
  ['Casey Rivera', 'COO', 'Acme Demo Co', 'ZEUS OPS turned our AI experiments into a working operating cadence in under two weeks.', [{ label: 'Hours saved / mo', value: '120' }]],
  ['Morgan Diaz', 'Head of Ops', 'Hooli Demo', 'The 48-hour sprint delivered a prioritized roadmap we actually shipped.', [{ label: 'Time to first deliverable', value: '48h' }]],
  ['Drew Singh', 'CEO', 'Pied Piper Demo', 'Like adding a fractional AI team without the hiring cycle.', [{ label: 'Support tickets deflected', value: '38%' }]],
] as const;
for (const [i, t] of testimonials.entries()) {
  await Testimonial.create({ name: t[0], role: t[1], company: t[2], content: t[3], rating: 5, metrics: [...t[4]], isActive: true, featured: i === 0, displayOrder: i });
}

for (const l of leads.slice(0, 5)) {
  await Activity.create({ userId: admin.id, type: 'lead_created', description: `Lead created: ${l.company}`, entityType: 'lead', entityId: l.id });
}

console.log('✅ Seeded sample data');
console.log('   admin    admin@zeusops.test    / ZeusAdmin!2026');
console.log('   operator operator@zeusops.test / ZeusOperator!2026');
console.log('   client   client@acme-demo.test / ZeusClient!2026');
process.exit(0);
