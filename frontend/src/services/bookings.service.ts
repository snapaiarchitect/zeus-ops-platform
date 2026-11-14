import { api, clean } from './api'
import type { Booking, BookingInput, BookingFilters, BookingStatus } from '@/types/booking'
import type { Pagination } from '@/types/crm'

export const bookingsService = {
  async getAll(params?: BookingFilters | string): Promise<{ bookings: Booking[]; pagination: Pagination }> {
    const query = typeof params === 'string' ? { status: params } : params
    const { data } = await api.get('/bookings', { params: { limit: 100, ...query } })
    return data
  },
  async create(input: BookingInput): Promise<Booking> {
    const { data } = await api.post<{ booking: Booking }>('/bookings', clean(input))
    return data.booking
  },
  async updateStatus(id: string, status: BookingStatus, extra?: { outcome?: string; followUpRequired?: boolean; followUpNotes?: string }): Promise<Booking> {
    const { data } = await api.patch<{ booking: Booking }>(`/bookings/${id}/status`, clean({ status, ...extra }))
    return data.booking
  },
  async getAvailability(from: string, to: string): Promise<{ bookedSlots: { time: string; duration: number }[] }> {
    const { data } = await api.get('/bookings/availability', { params: { from, to } })
    return data
  },
}
