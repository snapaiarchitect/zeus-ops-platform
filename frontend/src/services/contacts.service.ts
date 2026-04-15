import { api } from './api'
import type { Contact, CreateContactData, UpdateContactData } from '@/types/crm'

export const contactsService = {
  async getAll(params?: { search?: string; tags?: string[] }): Promise<Contact[]> {
    const response = await api.get<Contact[]>('/contacts', { params })
    return response.data
  },

  async getById(id: string): Promise<Contact> {
    const response = await api.get<Contact>(`/contacts/${id}`)
    return response.data
  },

  async create(data: CreateContactData): Promise<Contact> {
    const response = await api.post<Contact>('/contacts', data)
    return response.data
  },

  async update(id: string, data: UpdateContactData): Promise<Contact> {
    const response = await api.patch<Contact>(`/contacts/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`)
  },

  async getTags(): Promise<string[]> {
    const response = await api.get<string[]>('/contacts/tags')
    return response.data
  },
}
