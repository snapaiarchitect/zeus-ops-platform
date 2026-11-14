export type BookingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type BookingEventType = 'discovery' | 'strategy' | 'demo' | 'consultation' | 'check_in'

export interface Booking {
  id: string
  leadId?: string
  contactId?: string
  eventType: BookingEventType
  scheduledAt: string
  timezone: string
  duration: number
  status: BookingStatus
  meetingUrl?: string
  notes?: string
  outcome?: string
  followUpRequired: boolean
  followUpNotes?: string
  lead?: { id: string; email: string; firstName?: string; lastName?: string; company?: string }
  contact?: { id: string; email: string; firstName?: string; lastName?: string; company?: string }
  createdAt: string
  updatedAt: string
}

export interface BookingInput {
  leadId?: string
  contactId?: string
  eventType: BookingEventType
  scheduledAt: string
  timezone?: string
  duration?: number
  meetingUrl?: string
  notes?: string
}

export interface BookingFilters {
  status?: string
  eventType?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}
