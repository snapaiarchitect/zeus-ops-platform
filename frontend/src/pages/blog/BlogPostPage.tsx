import { useParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  User,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Bookmark,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { blogPosts } from './BlogPage'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3)

  // Simulated full content
  const fullContent = `
    <p>Artificial intelligence is fundamentally transforming how businesses operate. From automated customer service to intelligent document processing, AI agents are becoming indispensable tools for modern enterprises.</p>
    
    <h2>The Rise of Autonomous AI Agents</h2>
    <p>Unlike traditional automation tools that follow rigid scripts, modern AI agents can understand context, make decisions, and adapt to new situations. They can:</p>
    
    <ul>
      <li>Process natural language and understand intent</li>
      <li>Learn from interactions and improve over time</li>
      <li>Integrate with multiple systems and APIs</li>
      <li>Handle exceptions and edge cases gracefully</li>
      <li>Collaborate with human teams seamlessly</li>
    </ul>
    
    <h2>Real-World Impact</h2>
    <p>Companies implementing AI agents are seeing transformative results:</p>
    
    <blockquote>
      "Our AI agents handle 80% of routine inquiries, freeing our team to focus on complex customer needs."
    </blockquote>
    
    <p>These are not just incremental improvements—they represent a fundamental shift in how work gets done. Tasks that once required dedicated teams can now be handled by AI agents operating 24/7 with greater accuracy and consistency.</p>
    
    <h2>Getting Started with AI Agents</h2>
    <p>If you are considering AI agents for your business, here are key steps:</p>
    
    <ol>
      <li><strong>Identify repetitive tasks</strong> - Look for processes that follow patterns and consume significant time</li>
      <li><strong>Start with one use case</strong> - Pick a single workflow to automate and expand from there</li>
      <li><strong>Measure results</strong> - Track time saved, accuracy improved, and customer satisfaction</li>
      <li><strong>Scale gradually</strong> - Add more agents and workflows as you see success</li>
    </ol>
    
    <h2>The Future is Agentic</h2>
    <p>We are moving from an era of passive AI tools to active AI agents that can take initiative and complete complex multi-step tasks. This shift will redefine roles across every industry.</p>
    
    <p>The question is not whether AI agents will transform your industry, but how quickly you can adapt to leverage their capabilities.</p>
  `

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      {/* Back Navigation */}
      <div className="pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Header */}
      <article>
        <header className="pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full">
                  {post.category}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-800 text-slate-400 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-slate-400 mb-8">{post.excerpt}</p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{post.author.name}</p>
                    <p className="text-sm text-slate-500">{post.author.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="aspect-video bg-slate-800 rounded-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-slate-600 text-lg">Featured Image</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-400 prose-strong:text-white prose-li:text-slate-400 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-a:text-cyan-400 hover:prose-a:text-cyan-300"
            dangerouslySetInnerHTML={{ __html: fullContent }}
          />

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-slate-500">Share:</span>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span className="text-sm">Save for later</span>
              </button>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">{post.author.name}</h3>
                <p className="text-sm text-cyan-400 mb-2">{post.author.role}</p>
                <p className="text-slate-400 text-sm">
                  Expert in AI-powered operations with years of experience helping companies
                  scale through intelligent automation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.id}
                to={`/blog/${related.slug}`}
                className="group block bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-cyan-400">{related.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{related.readTime}</span>
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {related.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2">{related.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
