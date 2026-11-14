import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Bot,
  Workflow,
  LineChart,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  Play,
  Check,
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel'
import { Button } from '@/components/ui/Button'
import { pricingTiers } from '@/pages/pricing/PricingPage'
import { publicService, type PublicTestimonial } from '@/services/public.service'

const features = [
  {
    icon: Bot,
    title: 'AI Automation',
    description: 'We identify, build and run the AI workflows that take repetitive work off your team\u2019s plate.',
  },
  {
    icon: Workflow,
    title: 'Smart Workflows',
    description: 'Visual workflow builder with AI-powered decision nodes. Chain tools, APIs, and AI models seamlessly.',
  },
  {
    icon: LineChart,
    title: 'Real-time Analytics',
    description: 'Track every metric that matters. AI-powered insights predict trends before they happen.',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Role-based access, token authentication and a full activity log across your workspace.',
  },
  {
    icon: Clock,
    title: 'Predictable Cadence',
    description: 'A predictable weekly rhythm: Monday status, Wednesday check-in, Friday summary report.',
  },
  {
    icon: Sparkles,
    title: 'AI Learning',
    description: 'Systems that improve over time. Your AI agents learn from every interaction and outcome.',
  },
]

const stats = [
  { value: '48h', label: 'To First Deliverable' },
  { value: '3', label: 'Service Tiers' },
  { value: '25-150', label: 'Hours / Month' },
  { value: '4h', label: 'Priority Support Response' },
]

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function LandingPage() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([])
  useEffect(() => {
    publicService.getTestimonials().then(setTestimonials).catch(() => setTestimonials([]))
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Fractional AI operations team</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Operations at the
              <br />
              <span className="text-gradient">Speed of AI</span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Your fractional AI operations team. We find the highest-value AI opportunities,
              build them, and run them with you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <Zap className="w-5 h-5" />
                  Book a Discovery Call
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="gap-2">
                  See Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-cyan-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to
              <span className="text-gradient"> Scale</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete AI operations platform that handles the heavy lifting so you can focus on growth.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-slate-800/30 border border-slate-700 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Operations
              <span className="text-gradient"> Leaders</span>
            </h2>
          </AnimatedSection>

          {testimonials.length > 0 && <TestimonialsCarousel testimonials={testimonials} />}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent
              <span className="text-gradient"> Pricing</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three monthly tiers. Every engagement starts with a 48-hour onboarding sprint.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'bg-cyan-500/5 border-cyan-500/30 glow-cyan'
                    : 'bg-slate-800/30 border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-cyan-500" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/contact">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 p-12 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to put AI to work in your operations?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Book a discovery call and get your first AI opportunity assessment within 48 hours of kickoff.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="gap-2">
                    <Zap className="w-5 h-5" />
                    Book a Discovery Call
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg">
                    See Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
