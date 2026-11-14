import { api } from './api'
import type { DashboardSummary, ActivityItem, TeamMemberStats } from '@/types/analytics'

export const analyticsService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/analytics/summary')
    return data
  },
  async getRecentActivity(limit = 10): Promise<ActivityItem[]> {
    const { data } = await api.get<{ activities: ActivityItem[] }>('/analytics/activity', { params: { limit } })
    return data.activities
  },
  async getTeam(): Promise<TeamMemberStats[]> {
    const { data } = await api.get<{ team: TeamMemberStats[] }>('/team')
    return data.team
  },
}
