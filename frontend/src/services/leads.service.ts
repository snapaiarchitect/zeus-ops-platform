import { api, clean } from './api'
import type { Lead, LeadInput, LeadFilters, Pagination } from '@/types/crm'

export const leadsService = {
  async getAll(params?: LeadFilters): Promise<{ leads: Lead[]; pagination: Pagination }> {
    const { data } = await api.get('/leads', { params: { limit: 100, ...params } })
    return data
  },
  async getById(id: string): Promise<Lead> {
    const { data } = await api.get<{ lead: Lead }>(`/leads/${id}`)
    return data.lead
  },
  async create(input: LeadInput): Promise<Lead> {
    const { data } = await api.post<{ lead: Lead }>('/leads', clean(input))
    return data.lead
  },
  async update(id: string, input: Partial<LeadInput>): Promise<Lead> {
    const { data } = await api.patch<{ lead: Lead }>(`/leads/${id}`, clean(input))
    return data.lead
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/leads/${id}`)
  },
}
