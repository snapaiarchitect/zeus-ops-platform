import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  ArrowRight,
  User,
  Calendar,
  Search,
  TrendingUp,
  Sparkles,
  Bot,
  Workflow,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { BlogPost } from '@/types/blog'

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'ai-agents-future-of-work',
    title: 'AI Agents: The Future of Work is Here',
    excerpt:
      'Discover how autonomous AI agents are transforming business operations and what it means for the future of work.',
    content: '',
    author: {
      name: 'Alex Chen',
      role: 'Chief Technology Officer',
    },
    category: 'AI & Automation',
    tags: ['AI Agents', 'Future of Work', 'Automation'],
    publishedAt: '2026-04-10',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: '2',
    slug: 'scaling-operations-with-ai',
    title: 'Scaling Operations Without Scaling Headcount',
    excerpt:
      'Learn how leading companies use AI to 10x their operational capacity without proportional hiring.',
    content: '',
    author: {
      name: 'Sarah Miller',
      role: 'VP of Operations',
    },
    category: 'Operations',
    tags: ['Scaling', 'Efficiency', 'Growth'],
    publishedAt: '2026-04-08',
    readTime: '6 min read',
  },
  {
    id: '3',
    slug: 'building-ai-workflows',
    title: 'Building Effective AI Workflows: A Complete Guide',
    excerpt:
      'A step-by-step guide to designing, implementing, and optimizing AI-powered workflows for your business.',
    content: '',
    author: {
      name: 'James Wilson',
      role: 'Lead AI Engineer',
    },
    category: 'How-To',
    tags: ['Workflows', 'Tutorial', 'Best Practices'],
    publishedAt: '2026-04-05',
    readTime: '12 min read',
  },
  {
    id: '4',
    slug: 'roi-of-ai-automation',
    title: 'Calculating the ROI of AI Automation',
    excerpt:
      'How to measure the true impact of AI automation on your bottom line, beyond simple cost savings.',
    content: '',
    author: {
      name: 'Maria Garcia',
      role: 'Finance Director',
    },
    category: 'Strategy',
    tags: ['ROI', 'Finance', 'Metrics'],
    publishedAt: '2026-04-02',
    readTime: '7 min read',
  },
  {
    id: '5',
    slug: 'ai-customer-service-case-study',
    title: 'How TechCorp Reduced Support Tickets by 80%',
    excerpt:
      'An in-depth look at how one company transformed their customer support with AI agents.',
    content: '',
    author: {
      name: 'David Park',
      role: 'Customer Success Lead',
    },
    category: 'Case Study',
    tags: ['Customer Support', 'Case Study', 'Success Story'],
    publishedAt: '2026-03-28',
    readTime: '5 min read',
  },
  {
    id: '6',
    slug: 'ai-agents-vs-traditional-rpa',
    title: 'AI Agents vs Traditional RPA: What is the Difference?',
    excerpt:
      'Understanding the key differences between modern AI agents and legacy RPA solutions.',
    content: '',
    author: {
      name: 'Lisa Thompson',
      role: 'Product Manager',
    },
    category: 'Technology',
    tags: ['RPA', 'AI Agents', 'Comparison'],
    publishedAt: '2026-03-25',
    readTime: '6 min read',
  },
]

const categories = [
  { name: 'All', icon: Sparkles },
  { name: 'AI & Automation', icon: Bot },
  { name: 'Operations', icon: Workflow },
  { name: 'Strategy', icon: TrendingUp },
  { name: 'How-To', icon: Zap },
  { name: 'Case Study', icon: TrendingUp },
  { name: 'Technology', icon: Bot },
]

export function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const featuredPost = blogPosts.find((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  const filteredPosts = regularPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              ZEUS OPS <span className="text-cyan-400">Blog</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Insights, tutorials, and stories about AI-powered operations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="pb-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'All' && !searchQuery && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group block bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="aspect-video md:aspect-auto bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-24 h-24 text-slate-700" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-cyan-400 font-medium">
                      {featuredPost.category}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-400 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{featuredPost.author.name}</p>
                      <p className="text-xs text-slate-500">{featuredPost.author.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all h-full flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {post.category === 'AI & Automation' && <Bot className="w-16 h-16 text-slate-700" />}
                      {post.category === 'Operations' && <Workflow className="w-16 h-16 text-slate-700" />}
                      {post.category === 'Strategy' && <TrendingUp className="w-16 h-16 text-slate-700" />}
                      {post.category === 'How-To' && <Zap className="w-16 h-16 text-slate-700" />}
                      {post.category === 'Case Study' && <Sparkles className="w-16 h-16 text-slate-700" />}
                      {post.category === 'Technology' && <Bot className="w-16 h-16 text-slate-700" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-cyan-400">{post.category}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author & Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-cyan-400" />
                        </div>
                        <span className="text-xs text-slate-400">{post.author.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 mb-4">No articles match your search.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-slate-400 mb-6">
            Get the latest insights on AI operations delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
