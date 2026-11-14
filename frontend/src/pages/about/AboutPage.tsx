import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Target,
  Users,
  Rocket,
  Shield,
  Globe,
  Award,
  ArrowRight,
  Mail,
} from 'lucide-react'
import { Linkedin, Twitter } from '@/components/ui/BrandIcons'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'

const values = [
  {
    icon: Target,
    title: 'Customer Obsession',
    description:
      'We start with the customer and work backwards. Every feature, every improvement is driven by real customer needs.',
  },
  {
    icon: Rocket,
    title: 'Move Fast',
    description:
      'Speed matters in business. We help our customers move fast by eliminating operational bottlenecks with AI.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description:
      'We handle sensitive business data. Security is not an afterthought—it is built into everything we do.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description:
      'We are building for companies that want to operate globally. Our infrastructure scales with your ambitions.',
  },
]

const team = [
  {
    name: 'Alex Rivera',
    role: 'CEO & Co-Founder',
    bio: 'Former VP of Engineering at TechCorp. 15 years building scalable systems.',
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Sarah Chen',
    role: 'CTO & Co-Founder',
    bio: 'AI researcher turned engineer. Led ML teams at Google and OpenAI.',
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Product',
    bio: 'Product leader with experience at Salesforce, HubSpot, and Stripe.',
    social: { linkedin: '#', twitter: '#' },
  },
  {
    name: 'Elena Rodriguez',
    role: 'VP of Customer Success',
    bio: 'Built support organizations from 5 to 500 people. Customer-first mindset.',
    social: { linkedin: '#', twitter: '#' },
  },
]

const stats = [
  { value: '2022', label: 'Founded' },
  { value: '150+', label: 'Team Members' },
  { value: '500+', label: 'Customers' },
  { value: '$12M', label: 'Funding Raised' },
]

const milestones = [
  { year: '2022', event: 'ZEUS OPS founded in San Francisco' },
  { year: '2023', event: 'Launched AI Agent Platform v1.0' },
  { year: '2023', event: 'First 100 enterprise customers' },
  { year: '2024', event: 'Series A funding - $12M raised' },
  { year: '2024', event: 'Opened London and Singapore offices' },
  { year: '2025', event: 'Launched AI Agent Marketplace' },
  { year: '2026', label: 'Today', event: 'Powering operations for 500+ companies' },
]

export function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'story' | 'values'>('mission')

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Building the Future of
              <br />
              <span className="text-cyan-400">Operations</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We believe AI should handle the repetitive work so humans can focus on what
              they do best: creative problem-solving and building relationships.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Story / Values Tabs */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            {(['mission', 'story', 'values'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'mission' && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-6">
                    We are on a mission to democratize AI operations. Every business,
                    regardless of size, deserves access to enterprise-grade automation
                    that was once only available to tech giants.
                  </p>
                  <p className="text-slate-400 text-lg leading-relaxed mb-6">
                    By combining cutting-edge AI with intuitive design, we are building
                    tools that amplify human potential rather than replace it.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link to="/careers">
                      <Button className="gap-2">
                        Join Our Team
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="aspect-square bg-slate-800 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-32 h-32 text-cyan-500/30" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'story' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 md:-translate-x-1/2" />

                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.year}
                      className={`relative flex items-center gap-8 mb-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className="flex-1 md:text-right">
                        <div
                          className={`bg-slate-900/50 border border-slate-800 rounded-lg p-4 ${
                            index % 2 === 0 ? 'md:ml-auto' : ''
                          }`}
                        >
                          <span className="text-cyan-400 font-semibold">{milestone.year}</span>
                          <p className="text-slate-300 mt-1">{milestone.event}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center relative z-10 flex-shrink-0">
                        <div className="w-3 h-3 bg-slate-950 rounded-full" />
                      </div>
                      <div className="flex-1 hidden md:block" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="grid md:grid-cols-2 gap-8">
                {values.map((value) => (
                  <div
                    key={value.title}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-cyan-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-slate-400">{value.description}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet the Team</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We are a diverse team of engineers, designers, and operations experts united by
              a passion for building great products.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center"
              >
                <div className="w-24 h-24 bg-cyan-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-cyan-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-cyan-400 text-sm mb-2">{member.role}</p>
                <p className="text-slate-400 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a
                    href={member.social.linkedin}
                    className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={member.social.twitter}
                    className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Awards & Recognition</h2>
            <p className="text-slate-400">
              Honored to be recognized by the industry for our innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { award: 'Best AI Startup 2025', org: 'TechCrunch', icon: Award },
              { award: 'Top 50 SaaS Companies', org: 'Forbes', icon: Award },
              { award: 'Innovation Award', org: 'Product Hunt', icon: Award },
            ].map((item) => (
              <div
                key={item.award}
                className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl p-6"
              >
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{item.award}</h3>
                  <p className="text-slate-400 text-sm">{item.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Want to Join Us?</h2>
          <p className="text-xl text-slate-400 mb-8">
            We are always looking for talented people who want to shape the future of work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/careers">
              <Button size="lg">View Open Positions</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
