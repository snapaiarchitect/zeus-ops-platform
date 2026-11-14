import { api } from './api'

export interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  interest?: string
  message?: string
}

export interface PublicTestimonial {
  id: string
  quote: string
  author: string
  role: string
  company: string
  rating?: number
}

export const publicService = {
  async getTestimonials(): Promise<PublicTestimonial[]> {
    const { data } = await api.get<{ testimonials: { id: string; name: string; role: string; company: string; content: string; rating: number }[] }>('/public/testimonials')
    return data.testimonials.map((t) => ({ id: t.id, quote: t.content, author: t.name, role: t.role, company: t.company, rating: t.rating }))
  },

  async submitLead(form: ContactFormData): Promise<string> {
    const { data } = await api.post<{ message: string }>('/public/leads', form)
    return data.message
  },
}
