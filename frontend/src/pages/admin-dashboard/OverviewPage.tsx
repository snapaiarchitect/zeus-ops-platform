import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { analyticsService } from '@/services/analytics.service'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DashboardStats {
  totalLeads: number
  newLeadsThisMonth: number
  totalContacts: number
  totalRevenue: number
  mrr: number
  activeTasks: number
  pendingTasks: number
  upcomingBookings: number
  conversionRate: number
  leadsByStatus: { status: string; count: number }[]
  revenueByMonth: { month: string; amount: number }[]
}

interface RecentActivity {
  id: string
  type: string
  description: string
  user: { firstName: string; lastName: string }
  createdAt: string
}

export function AdminOverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRecentActivity(10)
      ])
      setStats(statsData)
      setRecentActivity(activityData)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.totalLeads || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'cyan'
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.mrr || 0).toLocaleString()}`,
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Tasks',
      value: stats?.activeTasks || 0,
      change: `${stats?.pendingTasks || 0} pending`,
      changeType: 'neutral',
      icon: CheckCircle,
      color: 'blue'
    },
    {
      title: 'Upcoming Bookings',
      value: stats?.upcomingBookings || 0,
      change: 'Next 7 days',
      changeType: 'neutral',
      icon: Calendar,
      color: 'purple'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome back, {user?.firstName}. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/admin/leads'}>
            View Leads
          </Button>
          <Button onClick={() => window.location.href = '/admin/bookings'}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-sm">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  ) : stat.changeType === 'negative' ? (
                    <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
                  ) : null}
                  <span className={
                    stat.changeType === 'positive' ? 'text-green-400' :
                    stat.changeType === 'negative' ? 'text-red-400' :
                    'text-slate-400'
                  }>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Overview */}
        <div className="lg:col-span-2 bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Lead Pipeline</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/admin/leads'}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {stats?.leadsByStatus?.map((status) => (
              <div key={status.status} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-400 capitalize">{status.status}</div>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg transition-all duration-500"
                    style={{
                      width: `${(status.count / (stats?.totalLeads || 1)) * 100}%`
                    }}
                  />
                </div>
                <div className="w-12 text-right text-white font-medium">{status.count}</div>
              </div>
            )) || (
              <div className="text-center py-8 text-slate-500">
                No lead data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {activity.user?.firstName} {activity.user?.lastName} • {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Add New Lead</h3>
          <p className="text-slate-400 text-sm mb-4">Manually add a prospect to the CRM</p>
          <Button onClick={() => window.location.href = '/admin/leads'} className="w-full">
            <Users className="w-4 h-4 mr-2" />
            Create Lead
          </Button>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Schedule Meeting</h3>
          <p className="text-slate-400 text-sm mb-4">Book a discovery call with a prospect</p>
          <Button variant="outline" onClick={() => window.location.href = '/admin/bookings'} className="w-full border-purple-500/50 hover:bg-purple-500/20">
            <Calendar className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Create Task</h3>
          <p className="text-slate-400 text-sm mb-4">Assign work to team members</p>
          <Button variant="outline" onClick={() => window.location.href = '/admin/tasks'} className="w-full border-green-500/50 hover:bg-green-500/20">
            <CheckCircle className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
    </div>
  )
}
