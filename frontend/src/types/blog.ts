export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    role: string
    avatar?: string
  }
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  featured?: boolean
  thumbnail?: string
}
