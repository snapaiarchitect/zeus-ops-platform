import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import type { PricingTier, FAQItem } from '@/types/pricing'

// Source of truth: OPERATIONS.md "Service Tiers" and DEPLOY.md "Pricing Tiers".
export const pricingTiers: PricingTier[] = [
  {
    name: 'Pilot',
    price: '$2,500',
    period: '/month',
    description: 'Test AI operations on a focused project',
    features: [
      '25 hours of AI operations support',
      '1 discovery call per month',
      'Email support (24-hour response)',
      'Weekly status reports',
      'Client dashboard access',
    ],
    cta: 'Book a Discovery Call',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$5,000',
    period: '/month',
    description: 'Ongoing implementation and custom AI tooling',
    features: [
      '50 hours of AI operations support',
      '2 strategy calls per month',
      'Slack / Teams channel access',
      'Priority support (4-hour response)',
      'Custom AI tool development',
      'Monthly performance reports',
    ],
    cta: 'Book a Discovery Call',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$15,000',
    period: '/month',
    description: 'A full fractional AI team embedded with yours',
    features: [
      '150 hours (dedicated team)',
      'Daily standups',
      'Dedicated Slack channel',
      'Real-time support',
      'Full AI infrastructure setup',
      'Quarterly business reviews',
      'On-site visits (2 per year)',
    ],
    cta: 'Book a Discovery Call',
    popular: false,
  },
]

const comparisonFeatures: { name: string; pilot: string; growth: string; enterprise: string }[] = [
  { name: 'Hours / month', pilot: '25', growth: '50', enterprise: '150' },
  { name: 'Calls', pilot: '1 discovery call / mo', growth: '2 strategy calls / mo', enterprise: 'Daily standups' },
  { name: 'Support response', pilot: '24 hours', growth: '4 hours', enterprise: 'Real-time' },
  { name: 'Shared channel', pilot: '—', growth: 'Slack / Teams', enterprise: 'Dedicated Slack' },
  { name: 'Reporting', pilot: 'Weekly status', growth: 'Weekly + monthly performance', enterprise: 'Weekly + quarterly reviews' },
  { name: 'Custom AI tooling', pilot: '—', growth: 'Yes', enterprise: 'Full infrastructure setup' },
  { name: 'On-site visits', pilot: '—', growth: '—', enterprise: '2 per year' },
]

const faqs: FAQItem[] = [
  {
    question: 'How does onboarding work?',
    answer:
      'Every engagement starts with a 48-hour sprint: discovery and intake in the first 4 hours, workspace and tooling setup through hour 24, and your first deliverable — an AI opportunity assessment with 30-day priorities — by hour 48.',
  },
  {
    question: 'Which tier is right for us?',
    answer:
      'Pilot suits teams testing AI operations on a small project. Growth fits ongoing implementation with custom AI tooling. Enterprise is a full fractional AI team with daily standups and on-site visits. A discovery call will help us recommend the right fit.',
  },
  {
    question: 'How does billing work?',
    answer:
      'Subscriptions are billed monthly and auto-charged. Invoices are issued on the 1st of the month with net 15 payment terms, and hours used are tracked in your client dashboard.',
  },
  {
    question: 'What does a typical week look like?',
    answer:
      'Monday: status email and prioritisation. Wednesday: mid-week check-in. Friday: summary report with hours logged and next week’s focus.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Book a discovery call from the contact page. We’ll talk through your operations, where you use AI today, and your biggest operational challenge, then propose an engagement.',
  },
]

function FAQItemComponent({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 text-left bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-medium text-slate-200">{item.question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-cyan-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 pt-0 text-slate-400 border-t border-slate-800">{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Fractional AI Operations, <span className="text-cyan-400">Priced by the Hour</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Three monthly tiers. Every engagement begins with a 48-hour onboarding sprint.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border p-8 ${
                  tier.popular ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                <p className="text-slate-400 text-sm mt-1 min-h-[40px]">{tier.description}</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                    {tier.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Compare tiers</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="text-left p-4 text-slate-400 font-medium">&nbsp;</th>
                  <th className="p-4 text-white font-semibold">Pilot</th>
                  <th className="p-4 text-white font-semibold">Growth</th>
                  <th className="p-4 text-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {comparisonFeatures.map((row) => (
                  <tr key={row.name}>
                    <td className="p-4 text-slate-300">{row.name}</td>
                    <td className="p-4 text-center text-slate-400">{row.pilot}</td>
                    <td className="p-4 text-center text-slate-400">{row.growth}</td>
                    <td className="p-4 text-center text-slate-400">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((item) => (
              <FAQItemComponent key={item.question} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to put AI to work in your operations?</h2>
          <p className="text-xl text-slate-400 mb-8">Book a discovery call and get a first deliverable within 48 hours of kickoff.</p>
          <Link to="/contact">
            <Button size="lg" className="gap-2">
              <Zap className="w-5 h-5" />
              Book a Discovery Call
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
