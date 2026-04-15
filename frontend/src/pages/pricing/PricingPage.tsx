import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Calculator,
  Users,
  Bot,
  Workflow,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { PricingTier, FAQItem } from '@/types/pricing'

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    description: 'Perfect for small teams getting started with AI operations',
    features: [
      '5 AI Agents',
      '1,000 tasks/month',
      'Basic analytics dashboard',
      'Email support',
      'Standard integrations',
      'Community access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/month',
    description: 'For growing teams with advanced automation needs',
    features: [
      '20 AI Agents',
      '10,000 tasks/month',
      'Advanced analytics & reporting',
      'Priority support (24/7)',
      'Custom workflow builder',
      'API access',
      'Team collaboration tools',
      'White-label options',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations at scale with custom requirements',
    features: [
      'Unlimited AI Agents',
      'Unlimited tasks',
      'Custom AI model training',
      'Dedicated account manager',
      'SLA guarantees (99.99%)',
      'On-premise deployment option',
      'Advanced security features',
      'Custom integrations',
      'Executive reporting',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const faqs: FAQItem[] = [
  {
    question: 'How does the AI agent pricing work?',
    answer:
      'Each AI agent can perform tasks autonomously. You pay based on the number of agents and tasks you need. Unused tasks roll over for up to 3 months on annual plans.',
  },
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer:
      'Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing cycle.',
  },
  {
    question: 'What happens if I exceed my task limit?',
    answer:
      'We will notify you when you are at 80% capacity. You can purchase additional task packs or upgrade your plan. We never stop your operations unexpectedly.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes, all plans include a 14-day free trial with full access to all features. No credit card required to start.',
  },
  {
    question: 'Do you offer discounts for nonprofits or education?',
    answer:
      'Absolutely! We offer 50% off for verified nonprofits and educational institutions. Contact our sales team for details.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'Starter includes email support with 24-hour response times. Professional adds priority support with 2-hour response times. Enterprise includes a dedicated account manager and 24/7 phone support.',
  },
]

const comparisonFeatures = [
  { name: 'AI Agents', starter: '5', professional: '20', enterprise: 'Unlimited' },
  { name: 'Monthly Tasks', starter: '1,000', professional: '10,000', enterprise: 'Unlimited' },
  { name: 'Team Members', starter: '3', professional: '15', enterprise: 'Unlimited' },
  { name: 'Analytics', starter: 'Basic', professional: 'Advanced', enterprise: 'Custom' },
  { name: 'API Access', starter: false, professional: true, enterprise: true },
  { name: 'Custom Workflows', starter: false, professional: true, enterprise: true },
  { name: 'White Label', starter: false, professional: true, enterprise: true },
  { name: 'Dedicated Support', starter: false, professional: false, enterprise: true },
  { name: 'SLA Guarantee', starter: false, professional: false, enterprise: '99.99%' },
  { name: 'On-Premise Option', starter: false, professional: false, enterprise: true },
]

function FAQItemComponent({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-medium text-slate-200">{item.question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-cyan-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 pt-0 text-slate-400 border-t border-slate-800">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PricingPage() {
  const [annual, setAnnual] = useState(true)
  const [calculatorAgents, setCalculatorAgents] = useState(5)
  const [calculatorTasks, setCalculatorTasks] = useState(1000)

  const calculatePrice = () => {
    const basePrice = 49
    const agentCost = Math.max(0, calculatorAgents - 5) * 10
    const taskCost = Math.max(0, Math.ceil((calculatorTasks - 1000) / 1000)) * 25
    const total = basePrice + agentCost + taskCost
    return annual ? total * 10 : total // 2 months free on annual
  }

  const getPrice = (tier: PricingTier) => {
    if (tier.price === 'Custom') return 'Custom'
    const basePrice = parseInt(tier.price.replace('$', ''))
    return annual ? `$${Math.round(basePrice * 0.83)}` : tier.price
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, Transparent <span className="text-cyan-400">Pricing</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  annual ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    annual ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${annual ? 'text-white' : 'text-slate-400'}`}>
                Annual <span className="text-cyan-400">(Save 17%)</span>
              </span>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border ${
                  tier.popular
                    ? 'bg-cyan-500/5 border-cyan-500/30'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{getPrice(tier)}</span>
                  {tier.price !== 'Custom' && (
                    <span className="text-slate-400">{annual ? '/year' : tier.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={tier.price === 'Custom' ? '/contact' : '/register'}>
                  <Button
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Calculator className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Calculate Your Cost
            </h2>
            <p className="text-slate-400">
              Estimate your monthly cost based on your needs
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Bot className="w-4 h-4 inline mr-2" />
                  Number of AI Agents
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={calculatorAgents}
                  onChange={(e) => setCalculatorAgents(parseInt(e.target.value) || 1)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">5 included in base plan</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Workflow className="w-4 h-4 inline mr-2" />
                  Monthly Tasks
                </label>
                <Input
                  type="number"
                  min={100}
                  step={100}
                  value={calculatorTasks}
                  onChange={(e) => setCalculatorTasks(parseInt(e.target.value) || 100)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">1,000 included in base plan</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-400">Estimated {annual ? 'Annual' : 'Monthly'} Cost</p>
                <p className="text-3xl font-bold text-white">${calculatePrice()}</p>
                {annual && (
                  <p className="text-xs text-cyan-400">Billed annually (2 months free)</p>
                )}
              </div>
              <Link to="/register">
                <Button size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-300 font-medium">Feature</th>
                  <th className="px-4 py-3 text-center text-slate-300 font-medium">Starter</th>
                  <th className="px-4 py-3 text-center text-cyan-400 font-medium bg-cyan-500/5">
                    Professional
                  </th>
                  <th className="px-4 py-3 text-center text-slate-300 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.name} className="bg-slate-900/30 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">{feature.name}</td>
                    <td className="px-4 py-3 text-center">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className="text-slate-400">{feature.starter}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center bg-cyan-500/5">
                      {typeof feature.professional === 'boolean' ? (
                        feature.professional ? (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className="text-slate-400">{feature.professional}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className="text-slate-400">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItemComponent key={faq.question} item={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                <Zap className="w-5 h-5" />
                Start Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
