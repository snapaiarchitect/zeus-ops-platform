import { api } from './api'
import type { Lead, LeadStatus, CreateLeadData, UpdateLeadData } from '@/types/crm'

export const leadsService = {
  async getAll(params?: { status?: LeadStatus; search?: string }): Promise<Lead[]> {
    const response = await api.get<Lead[]>('/leads', { params })
    return response.data
  },

  async getById(id: string): Promise<Lead> {
    const response = await api.get<Lead>(`/leads/${id}`)
    return response.data
  },

  async create(data: CreateLeadData): Promise<Lead> {
    const response = await api.post<Lead>('/leads', data)
    return response.data
  },

  async update(id: string, data: UpdateLeadData): Promise<Lead> {
    const response = await api.patch<Lead>(`/leads/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/leads/${id}`)
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const response = await api.patch<Lead>(`/leads/${id}/status`, { status })
    return response.data
  },

  async getPipeline(): Promise<{ status: LeadStatus; leads: Lead[]; count: number }[]> {
    const response = await api.get('/leads/pipeline')
    return response.data
  },
}
