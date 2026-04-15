import { api } from './api'
import type { Booking, CreateBookingData, UpdateBookingData } from '@/types/booking'

export const bookingsService = {
  async getAll(params?: { startDate?: string; endDate?: string; status?: string }): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings', { params })
    return response.data
  },

  async getById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/bookings/${id}`)
    return response.data
  },

  async create(data: CreateBookingData): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data)
    return response.data
  },

  async update(id: string, data: UpdateBookingData): Promise<Booking> {
    const response = await api.patch<Booking>(`/bookings/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`)
  },

  async getAvailability(date: string): Promise<{ time: string; available: boolean }[]> {
    const response = await api.get(`/bookings/availability`, { params: { date } })
    return response.data
  },
}
