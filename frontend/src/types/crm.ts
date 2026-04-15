export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: LeadStatus
  source: string
  value?: number
  notes?: string
  assignedTo?: string
  lastContactedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadData {
  name: string
  email: string
  phone?: string
  company?: string
  source: string
  value?: number
  notes?: string
}

export interface UpdateLeadData {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: LeadStatus
  source?: string
  value?: number
  notes?: string
  assignedTo?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  title?: string
  tags: string[]
  avatar?: string
  notes?: string
  lastContactedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateContactData {
  name: string
  email: string
  phone?: string
  company?: string
  title?: string
  tags?: string[]
  notes?: string
}

export interface UpdateContactData {
  name?: string
  email?: string
  phone?: string
  company?: string
  title?: string
  tags?: string[]
  notes?: string
}
