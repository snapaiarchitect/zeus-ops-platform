export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
export type LeadPriority = 'low' | 'medium' | 'high'

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface Lead {
  id: string
  email: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  status: LeadStatus
  source: string
  priority: LeadPriority
  estimatedValue?: number | string
  notes?: string
  assignedTo?: string
  tags: string[]
  lastContactedAt?: string
  nextFollowUpAt?: string
  createdAt: string
  updatedAt: string
}

export interface LeadInput {
  email: string
  firstName?: string
  lastName?: string
  company?: string
  phone?: string
  status?: LeadStatus
  source?: string
  priority?: LeadPriority
  estimatedValue?: number | string
  notes?: string
  assignedTo?: string
  tags?: string[]
}

export interface LeadFilters {
  status?: string
  priority?: string
  assignedTo?: string
  source?: string
  search?: string
  page?: number
  limit?: number
}

export interface Contact {
  id: string
  email: string
  firstName?: string
  lastName?: string
  company?: string
  jobTitle?: string
  phone?: string
  linkedinUrl?: string
  website?: string
  city?: string
  state?: string
  country?: string
  tags: string[]
  notes?: string
  isClient: boolean
  clientSince?: string
  lifetimeValue?: number | string
  lastInteractionAt?: string
  createdAt: string
  updatedAt: string
}

export type ContactInput = Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> & { email: string }

export interface ContactFilters {
  search?: string
  company?: string
  isClient?: boolean
  page?: number
  limit?: number
}
