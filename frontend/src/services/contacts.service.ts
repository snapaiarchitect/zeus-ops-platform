import { api, clean } from './api'
import type { Contact, ContactInput, ContactFilters, Pagination } from '@/types/crm'

export const contactsService = {
  async getAll(params?: ContactFilters): Promise<{ contacts: Contact[]; pagination: Pagination }> {
    const { data } = await api.get('/contacts', { params: { limit: 100, ...params } })
    return data
  },
  async getById(id: string): Promise<Contact> {
    const { data } = await api.get<{ contact: Contact }>(`/contacts/${id}`)
    return data.contact
  },
  async create(input: ContactInput): Promise<Contact> {
    const { data } = await api.post<{ contact: Contact }>('/contacts', clean(input))
    return data.contact
  },
  async update(id: string, input: Partial<ContactInput>): Promise<Contact> {
    const { data } = await api.patch<{ contact: Contact }>(`/contacts/${id}`, clean(input))
    return data.contact
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`)
  },
}
