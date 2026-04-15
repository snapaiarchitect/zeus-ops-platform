export type TimeRange = '7d' | '30d' | '90d' | '1y'

export interface AnalyticsDashboard {
  totalLeads: number
  newLeads: number
  convertedLeads: number
  conversionRate: number
  totalRevenue: number
  revenueChange: number
  activeClients: number
  tasksCompleted: number
  upcomingBookings: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'lead' | 'contact' | 'booking' | 'task' | 'payment'
  title: string
  description: string
  timestamp: string
  user?: string
}

export interface LeadAnalytics {
  bySource: { source: string; count: number }[]
  byStatus: { status: string; count: number }[]
  timeline: { date: string; new: number; converted: number }[]
  conversionFunnel: { stage: string; count: number; rate: number }[]
}

export interface RevenueAnalytics {
  byMonth: { month: string; revenue: number; expenses: number }[]
  byService: { service: string; revenue: number }[]
  outstanding: number
  projected: number
}
