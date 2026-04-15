import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  MessageSquare,
  HelpCircle,
  Book,
  Video,
  FileText,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'

interface Ticket {
  id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: string
  updatedAt: string
  replies: number
}

const tickets: Ticket[] = [
  {
    id: '1',
    subject: 'API Integration Issue',
    description: 'Having trouble connecting to the REST API from our internal system.',
    status: 'in_progress',
    priority: 'high',
    category: 'Technical',
    createdAt: '2026-04-10T10:30:00Z',
    updatedAt: '2026-04-10T14:20:00Z',
    replies: 3,
  },
  {
    id: '2',
    subject: 'Billing Question',
    description: 'Need clarification on the invoice from last month.',
    status: 'resolved',
    priority: 'medium',
    category: 'Billing',
    createdAt: '2026-04-05T09:15:00Z',
    updatedAt: '2026-04-06T11:30:00Z',
    replies: 2,
  },
  {
    id: '3',
    subject: 'Feature Request: Custom Webhooks',
    description: 'Would love to see support for custom webhook triggers.',
    status: 'open',
    priority: 'low',
    category: 'Feature Request',
    createdAt: '2026-04-14T16:45:00Z',
    updatedAt: '2026-04-14T16:45:00Z',
    replies: 0,
  },
]

const helpCategories = [
  {
    icon: Book,
    title: 'Documentation',
    description: 'Browse our comprehensive guides and API docs',
    link: '/docs',
    articles: 156,
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch step-by-step tutorials and demos',
    link: '/tutorials',
    articles: 42,
  },
  {
    icon: FileText,
    title: 'FAQs',
    description: 'Find answers to commonly asked questions',
    link: '/faq',
    articles: 89,
  },
  {
    icon: MessageSquare,
    title: 'Community',
    description: 'Connect with other users and share tips',
    link: '/community',
    articles: '2.4k',
  },
]

const quickLinks = [
  { title: 'Getting Started Guide', icon: Book },
  { title: 'API Reference', icon: FileText },
  { title: 'Webhook Setup', icon: HelpCircle },
  { title: 'Troubleshooting', icon: AlertCircle },
]

export function ClientSupportPage() {
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Ticket['status'] | 'all'>('all')
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium' as Ticket['priority'],
  })

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateTicket = () => {
    // Simulate creating a ticket
    console.log('Creating ticket:', newTicket)
    setIsCreateTicketOpen(false)
    setNewTicket({
      subject: '',
      description: '',
      category: 'technical',
      priority: 'medium',
    })
  }

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'in_progress':
        return 'bg-cyan-500/20 text-cyan-400'
      case 'resolved':
        return 'bg-green-500/20 text-green-400'
      case 'closed':
        return 'bg-slate-700 text-slate-400'
    }
  }

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-slate-400">Get help and manage your support tickets</p>
        </div>
        <Button onClick={() => setIsCreateTicketOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      {/* Help Center Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpCategories.map((category) => (
          <Link
            key={category.title}
            to={category.link}
            className="group p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition-all"
          >
            <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <category.icon className="w-5 h-5 text-cyan-500" />
            </div>
            <h3 className="font-semibold text-white mb-1">{category.title}</h3>
            <p className="text-slate-400 text-sm mb-3">{category.description}</p>
            <p className="text-slate-500 text-xs">{category.articles} articles</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Ticket['status'] | 'all')}
              className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No tickets found</p>
                <p className="text-slate-500 text-sm mt-1">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create a ticket to get support'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{ticket.subject}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </span>
                          <span>•</span>
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </span>
                          {ticket.replies > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {ticket.replies} replies
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Popular Articles</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  to="#"
                  className="flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm">{link.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">Need Immediate Help?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Our support team is available 24/7 for Professional and Enterprise plans.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">Email: support@zeusops.com</p>
              <p className="text-slate-300">Phone: +1 (555) 123-4567</p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-white">All Systems Operational</span>
            </div>
            <p className="text-slate-400 text-sm">
              Last updated: 2 minutes ago
            </p>
            <Link
              to="/status"
              className="text-cyan-400 text-sm hover:text-cyan-300 mt-3 inline-block"
            >
              View Status Page →
            </Link>
          </div>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="feature">Feature Request</option>
                  <option value="account">Account</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, priority: e.target.value as Ticket['priority'] })
                  }
                  className="w-full h-9 rounded-md border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Please provide detailed information about your issue..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTicketOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={!newTicket.subject.trim() || !newTicket.description.trim()}
            >
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
