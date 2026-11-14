import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Building2,
  Quote,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { SampleContentNotice } from '@/components/SampleContentNotice'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { caseStudies } from './CaseStudiesPage'

export function CaseStudyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const study = caseStudies.find((s) => s.id === id)

  if (!study) {
    return <Navigate to="/case-studies" replace />
  }

  const relatedStudies = caseStudies.filter((s) => s.id !== id).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />
      <SampleContentNotice />

      {/* Back Navigation */}
      <div className="pt-24 pb-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/case-studies"
            className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Case Studies
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full">
                {study.industry}
              </span>
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-800 text-slate-400 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{study.title}</h1>
            <p className="text-xl text-slate-400 mb-6">{study.subtitle}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{study.client}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Implementation: {study.duration}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Thumbnail */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-32 h-32 text-slate-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Key Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {study.results.map((result) => (
              <div key={result.metric} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                  {result.value}
                </p>
                <p className="text-slate-300 mb-1">{result.metric}</p>
                <p className="text-sm text-cyan-500">{result.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">The Challenge</h2>
                <p className="text-slate-400 leading-relaxed">{study.challenge}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Our Solution</h2>
                <p className="text-slate-400 leading-relaxed">{study.solution}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Implementation</h2>
                <ul className="space-y-3">
                  {[
                    'Discovery & requirements gathering',
                    'Custom AI agent development',
                    'Integration with existing systems',
                    'Testing & refinement',
                    'Full deployment with monitoring',
                  ].map((step) => (
                    <li key={step} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-400">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Testimonial */}
              {study.testimonial && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <Quote className="w-8 h-8 text-cyan-500 mb-4" />
                  <p className="text-slate-300 italic mb-4">"{study.testimonial.quote}"</p>
                  <div>
                    <p className="text-white font-medium">{study.testimonial.author}</p>
                    <p className="text-slate-500 text-sm">{study.testimonial.role}</p>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Want Similar Results?
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Let's discuss how ZEUS OPS can transform your operations.
                </p>
                <Link to="/contact">
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Studies */}
      <section className="py-12 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Related Case Studies</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedStudies.map((related) => (
              <Link
                key={related.id}
                to={`/case-studies/${related.id}`}
                className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
              >
                <span className="text-xs text-cyan-400">{related.industry}</span>
                <h3 className="text-lg font-semibold text-white mt-2 mb-2 group-hover:text-cyan-400 transition-colors">
                  {related.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2">{related.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
