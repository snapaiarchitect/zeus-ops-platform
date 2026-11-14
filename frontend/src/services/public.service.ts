import { api } from './api'

export interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  interest?: string
  message?: string
}

export const publicService = {
  async submitLead(form: ContactFormData): Promise<string> {
    const { data } = await api.post<{ message: string }>('/public/leads', form)
    return data.message
  },
}
