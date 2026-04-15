export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  client: string
  industry: string
  duration: string
  thumbnail: string
  tags: string[]
  summary: string
  challenge: string
  solution: string
  results: {
    metric: string
    value: string
    change: string
  }[]
  testimonial?: {
    quote: string
    author: string
    role: string
  }
  content?: string
}
