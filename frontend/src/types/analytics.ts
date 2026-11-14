export interface DashboardSummary {
  totalLeads: number
  newLeadsThisMonth: number
  totalContacts: number
  totalRevenue: number
  mrr: number
  activeTasks: number
  pendingTasks: number
  upcomingBookings: number
  conversionRate: number
  avgDealSize: number
  leadsByStatus: { status: string; count: number; percentage: number }[]
  leadsBySource: { source: string; count: number }[]
  revenueByMonth: { month: string; revenue: number; newMrr: number; churnedMrr: number }[]
  topClients: { name: string; revenue: number }[]
  pipelineValue: number
  pipelineByStage: { stage: string; value: number; count: number }[]
  taskStats: { total: number; completed: number; completionRate: number }
}

export interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string
  user?: { firstName: string; lastName: string }
}

export interface TeamMemberStats {
  user: import('./auth').User
  totalTasks: number
  openTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  hoursLogged: number
  efficiency: number
  currentWorkload: import('./task').Task[]
}
