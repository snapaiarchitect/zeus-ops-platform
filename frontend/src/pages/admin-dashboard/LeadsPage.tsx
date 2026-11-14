import { useState, useEffect } from 'react'
import { leadsService } from '@/services/leads.service'
import { Lead, LeadStatus } from '@/types/crm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { KanbanBoard } from '@/components/ui/KanbanBoard'
import { DataTable } from '@/components/ui/DataTable'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Tag
} from 'lucide-react'

const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  qualified: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  proposal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  negotiation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  closed_won: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed_lost: 'bg-red-500/20 text-red-400 border-red-500/30'
}

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  })

  const [newLead, setNewLead] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    status: 'new' as LeadStatus,
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedValue: '',
    notes: ''
  })

  useEffect(() => {
    loadLeads()
  }, [filters])

  const loadLeads = async () => {
    try {
      const data = await leadsService.getAll(filters)
      setLeads(data.leads)
    } catch (error) {
      console.error('Failed to load leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLead = async () => {
    try {
      await leadsService.create(newLead)
      setIsCreateDialogOpen(false)
      setNewLead({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        status: 'new',
        priority: 'medium',
        estimatedValue: '',
        notes: ''
      })
      loadLeads()
    } catch (error) {
      console.error('Failed to create lead:', error)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await leadsService.update(leadId, { status: newStatus })
      loadLeads()
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const filteredLeads = leads.filter(lead =>
    searchQuery === '' ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const kanbanColumns = LEAD_STATUSES.map(status => ({
    id: status,
    title: status.replace('_', ' ').toUpperCase(),
    items: filteredLeads.filter(lead => lead.status === status)
  }))

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (lead: Lead) => (
        <div>
          <p className="font-medium text-white">{lead.firstName} {lead.lastName}</p>
          <p className="text-sm text-slate-400">{lead.email}</p>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (lead: Lead) => (
        <span className="text-slate-300">{lead.company || '-'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: Lead) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status]}`}>
          {lead.status.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (lead: Lead) => (
        <span className={`text-xs ${
          lead.priority === 'high' ? 'text-red-400' :
          lead.priority === 'medium' ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {lead.priority}
        </span>
      )
    },
    {
      key: 'value',
      header: 'Est. Value',
      render: (lead: Lead) => (
        <span className="text-slate-300">
          {lead.estimatedValue ? `$${Number(lead.estimatedValue).toLocaleString()}` : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (lead: Lead) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = `mailto:${lead.email}`}>
            <Mail className="w-4 h-4" />
          </Button>
          {lead.phone && (
            <Button variant="ghost" size="sm" onClick={() => window.location.href = `tel:${lead.phone}`}>
              <Phone className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">Manage your sales pipeline</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-[#0f0f1b] rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === 'list' 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-[#0f0f1b] border border-white/10 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map(status => (
            <option key={status} value={status}>{status.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="bg-[#0f0f1b] border border-white/10 rounded-lg px-4 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          columns={kanbanColumns}
          onMoveItem={(id, toColumn) => handleStatusChange(id, toColumn as LeadStatus)}
          renderItem={(lead) => (
            <div className="p-4 bg-[#0a0a0f] border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-white">{lead.firstName} {lead.lastName}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}>
                  {lead.priority}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{lead.company}</p>
              {lead.estimatedValue && (
                <p className="text-sm text-cyan-400">
                  ${Number(lead.estimatedValue).toLocaleString()}
                </p>
              )}
              {lead.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {lead.tags.map((tag, i) => (
                    <span key={i} className="text-xs text-slate-500">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          keyExtractor={(lead) => lead.id}
        />
      )}

      {/* Create Lead Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newLead.firstName}
                onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={newLead.lastName}
                onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
              />
            </div>
            <Input
              type="email"
              placeholder="Email *"
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            />
            <Input
              placeholder="Company"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            />
            <Input
              placeholder="Estimated Value ($)"
              type="number"
              value={newLead.estimatedValue}
              onChange={(e) => setNewLead({ ...newLead, estimatedValue: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newLead.status}
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value as LeadStatus })}
                className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
              >
                {LEAD_STATUSES.map(status => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
              <select
                value={newLead.priority}
                onChange={(e) => setNewLead({ ...newLead, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <textarea
              placeholder="Notes..."
              value={newLead.notes}
              onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
              className="w-full h-24 bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateLead} className="flex-1">
                Create Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
