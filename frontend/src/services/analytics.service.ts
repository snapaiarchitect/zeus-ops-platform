import { api } from './api'
import type { AnalyticsDashboard, TimeRange, LeadAnalytics, RevenueAnalytics } from '@/types/analytics'

export const analyticsService = {
  async getDashboard(timeRange: TimeRange): Promise<AnalyticsDashboard> {
    const response = await api.get<AnalyticsDashboard>('/analytics/dashboard', {
      params: { timeRange },
    })
    return response.data
  },

  async getLeadAnalytics(timeRange: TimeRange): Promise<LeadAnalytics> {
    const response = await api.get<LeadAnalytics>('/analytics/leads', {
      params: { timeRange },
    })
    return response.data
  },

  async getRevenueAnalytics(timeRange: TimeRange): Promise<RevenueAnalytics> {
    const response = await api.get<RevenueAnalytics>('/analytics/revenue', {
      params: { timeRange },
    })
    return response.data
  },

  async getTeamPerformance(): Promise<{
    userId: string
    name: string
    tasksCompleted: number
    leadsConverted: number
    revenue: number
  }[]> {
    const response = await api.get('/analytics/team-performance')
    return response.data
  },
}
