import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Filter,
  TrendingUp,
  Clock,
  Building2,
  Search,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CaseStudy } from '@/types/case-study'

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Automating Customer Support at Scale',
    subtitle: 'How TechCorp reduced support tickets by 80% with AI agents',
    client: 'TechCorp Inc.',
    industry: 'SaaS',
    duration: '3 months',
    thumbnail: '/case-studies/techcorp.jpg',
    tags: ['Customer Support', 'AI Automation', 'Enterprise'],
    summary:
      'TechCorp faced overwhelming customer support volume. We deployed AI agents to handle tier-1 support, freeing human agents for complex issues.',
    challenge:
      'TechCorp was drowning in 50,000+ support tickets monthly. Their 45-person support team could not keep up, leading to 72-hour response times and declining customer satisfaction.',
    solution:
      'We deployed 12 specialized AI agents across their support channels. The agents were trained on 5 years of support history and integrated with their CRM and knowledge base.',
    results: [
      { metric: 'Response Time', value: '72h → 5min', change: '-99%' },
      { metric: 'Tickets Resolved', value: '40,000/mo', change: 'AI-handled' },
      { metric: 'CSAT Score', value: '4.2 → 4.8', change: '+14%' },
      { metric: 'Support Costs', value: '$180k → $45k', change: '-75%' },
    ],
    testimonial: {
      quote:
        'ZEUS OPS transformed our customer experience. Our team now focuses on strategic improvements while AI handles the routine.',
      author: 'Sarah Chen',
      role: 'VP of Operations',
    },
  },
  {
    id: '2',
    title: 'Lead Qualification Revolution',
    subtitle: 'GrowthLabs 3x their conversion rate with AI-powered lead scoring',
    client: 'GrowthLabs',
    industry: 'Marketing Agency',
    duration: '2 months',
    thumbnail: '/case-studies/growthlabs.jpg',
    tags: ['Lead Generation', 'Sales Automation', 'SMB'],
    summary:
      'GrowthLabs struggled to qualify leads quickly. Our AI system now scores and nurtures leads 24/7, delivering only hot prospects to sales.',
    challenge:
      'GrowthLabs generated 2,000 leads monthly but their sales team wasted 60% of their time on unqualified prospects. They needed a way to focus on high-value opportunities.',
    solution:
      'We built an AI lead scoring system that analyzes behavioral data, firmographics, and engagement patterns. Hot leads are automatically routed to sales with full context.',
    results: [
      { metric: 'Conversion Rate', value: '8% → 24%', change: '+200%' },
      { metric: 'Sales Cycle', value: '45 → 21 days', change: '-53%' },
      { metric: 'Pipeline Value', value: '$2.4M', change: '+180%' },
      { metric: 'Cost per Lead', value: '$45 → $18', change: '-60%' },
    ],
    testimonial: {
      quote:
        'The AI does not just score leads—it understands them. Our sales team now spends 100% of their time on prospects that matter.',
      author: 'Marcus Johnson',
      role: 'Chief Revenue Officer',
    },
  },
  {
    id: '3',
    title: 'E-commerce Order Processing Automation',
    subtitle: 'ScaleUp Ventures eliminated manual order processing bottlenecks',
    client: 'ScaleUp Ventures',
    industry: 'E-commerce',
    duration: '4 months',
    thumbnail: '/case-studies/scaleup.jpg',
    tags: ['Operations', 'E-commerce', 'Mid-Market'],
    summary:
      'Rapid growth created chaos in order processing. Our AI agents now handle the entire fulfillment workflow with 99.9% accuracy.',
    challenge:
      'ScaleUp went from 100 to 10,000 orders daily in 6 months. Their manual order processing could not scale, causing shipping delays and inventory mismatches.',
    solution:
      'We deployed an end-to-end order processing system with AI agents handling order validation, inventory checks, payment processing, and shipping coordination.',
    results: [
      { metric: 'Processing Time', value: '4h → 2min', change: '-99%' },
      { metric: 'Error Rate', value: '5% → 0.1%', change: '-98%' },
      { metric: 'Orders/Day', value: '25,000', change: 'Scalable' },
      { metric: 'Labor Costs', value: '$120k → $20k', change: '-83%' },
    ],
    testimonial: {
      quote:
        'ZEUS OPS grew with us. What started as a simple automation became the backbone of our entire operation.',
      author: 'Elena Rodriguez',
      role: 'Founder & CEO',
    },
  },
  {
    id: '4',
    title: 'Healthcare Appointment Scheduling',
    subtitle: 'MediCare Plus automated patient scheduling and reduced no-shows',
    client: 'MediCare Plus',
    industry: 'Healthcare',
    duration: '2 months',
    thumbnail: '/case-studies/medicare.jpg',
    tags: ['Healthcare', 'Scheduling', 'Enterprise'],
    summary:
      'Manual appointment scheduling consumed staff time and led to errors. AI agents now handle scheduling, reminders, and rescheduling seamlessly.',
    challenge:
      'MediCare Plus had 15 staff members handling appointments for 50+ providers. Phone wait times exceeded 20 minutes and no-show rates were at 25%.',
    solution:
      'AI scheduling agents integrated with their EHR system handle bookings 24/7, send intelligent reminders, and automatically fill cancellations from waitlists.',
    results: [
      { metric: 'No-Show Rate', value: '25% → 8%', change: '-68%' },
      { metric: 'Phone Wait Time', value: '20min → 0min', change: 'Self-serve' },
      { metric: 'Booking Efficiency', value: '+340%', change: '24/7 available' },
      { metric: 'Staff Time Saved', value: '120 hrs/week', change: 'Reallocated' },
    ],
    testimonial: {
      quote:
        'Our patients love booking online, and our staff can focus on care rather than calendars.',
      author: 'Dr. James Mitchell',
      role: 'Medical Director',
    },
  },
  {
    id: '5',
    title: 'Financial Document Processing',
    subtitle: 'FinServe automated loan application processing with 10x speed',
    client: 'FinServe',
    industry: 'Financial Services',
    duration: '5 months',
    thumbnail: '/case-studies/finserve.jpg',
    tags: ['FinTech', 'Document AI', 'Enterprise'],
    summary:
      'Loan processing was painfully slow and error-prone. AI agents now extract, verify, and process documents in minutes instead of days.',
    challenge:
      'FinServe processed 500 loan applications monthly, each taking 5 days to review. Document errors caused 30% of applications to need rework.',
    solution:
      'We built document intelligence agents that extract data from any format, verify against sources, flag discrepancies, and route for approval.',
    results: [
      { metric: 'Processing Time', value: '5 days → 4 hours', change: '-97%' },
      { metric: 'Monthly Volume', value: '500 → 3,000', change: '+500%' },
      { metric: 'Error Rate', value: '30% → 2%', change: '-93%' },
      { metric: 'Customer Satisfaction', value: '3.2 → 4.6', change: '+44%' },
    ],
    testimonial: {
      quote:
        'We went from paper pushers to value creators. Our underwriters now focus on complex decisions while AI handles the routine.',
      author: 'Lisa Thompson',
      role: 'Head of Operations',
    },
  },
  {
    id: '6',
    title: 'Supply Chain Intelligence',
    subtitle: 'LogiChain optimized inventory with predictive AI agents',
    client: 'LogiChain',
    industry: 'Logistics',
    duration: '6 months',
    thumbnail: '/case-studies/logichain.jpg',
    tags: ['Supply Chain', 'Predictive AI', 'Enterprise'],
    summary:
      'Inventory management was reactive and wasteful. AI agents now predict demand, optimize stock levels, and automate reordering.',
    challenge:
      'LogiChain carried $50M in inventory but still had 15% stockouts. Excess inventory and stockouts were costing them millions annually.',
    solution:
      'Predictive AI agents analyze demand patterns, seasonal trends, and supply chain signals to optimize inventory levels and automate purchasing.',
    results: [
      { metric: 'Stockout Rate', value: '15% → 2%', change: '-87%' },
      { metric: 'Inventory Value', value: '$50M → $35M', change: '-30%' },
      { metric: 'Carrying Costs', value: '$5M → $3.5M', change: '-30%' },
      { metric: 'Forecast Accuracy', value: '68% → 94%', change: '+38%' },
    ],
    testimonial: {
      quote:
        'The AI sees patterns we never could. We now run leaner and serve customers better at the same time.',
      author: 'Robert Kim',
      role: 'VP of Supply Chain',
    },
  },
]

const industries = ['All', 'SaaS', 'Healthcare', 'E-commerce', 'FinTech', 'Logistics', 'Marketing']
const tags = ['All', 'AI Automation', 'Enterprise', 'SMB', 'Customer Support', 'Lead Generation', 'Operations']

export function CaseStudiesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [selectedTag, setSelectedTag] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCaseStudies = caseStudies.filter((study) => {
    const matchesIndustry = selectedIndustry === 'All' || study.industry === selectedIndustry
    const matchesTag = selectedTag === 'All' || study.tags.includes(selectedTag)
    const matchesSearch =
      searchQuery === '' ||
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesIndustry && matchesTag && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Customer <span className="text-cyan-400">Success Stories</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              See how leading companies transform their operations with AI-powered automation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCaseStudies.map((study, index) => (
              <motion.article
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-slate-700" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-slate-950/80 text-cyan-400 text-xs font-medium rounded-full">
                      {study.industry}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {study.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{study.summary}</p>

                  {/* Results Preview */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {study.results.slice(0, 2).map((result) => (
                      <div key={result.metric} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">{result.metric}</p>
                        <p className="text-sm font-semibold text-white">{result.value}</p>
                        <p className="text-xs text-cyan-400">{result.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {study.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/case-studies/${study.id}`}
                    className="flex items-center text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors"
                  >
                    Read Case Study
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredCaseStudies.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400">No case studies match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedIndustry('All')
                  setSelectedTag('All')
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Companies Transformed' },
              { value: '$2.4B', label: 'Revenue Generated' },
              { value: '10M+', label: 'Tasks Automated' },
              { value: '99.9%', label: 'Uptime Guaranteed' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join hundreds of companies transforming their operations with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="gap-2">
                <TrendingUp className="w-5 h-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
