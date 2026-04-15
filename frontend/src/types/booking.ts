export interface Booking {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  clientName: string
  clientEmail: string
  clientPhone?: string
  assignedTo?: string
  meetingUrl?: string
  location?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingData {
  title: string
  description?: string
  startTime: string
  endTime: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  location?: string
  notes?: string
}

export interface UpdateBookingData {
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  status?: Booking['status']
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  location?: string
  notes?: string
}
