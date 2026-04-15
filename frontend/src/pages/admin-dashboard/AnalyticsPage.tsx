import { useState, useEffect } from 'react'
import { analyticsService } from '@/services/analytics.service'
import { Button } from '@/components/ui/Button'
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  ArrowUpRight,
  Download
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalLeads: number
    totalContacts: number
    totalRevenue: number
    mrr: number
    conversionRate: number
    avgDealSize: number
  }
  leadsByStatus: { status: string; count: number; percentage: number }[]
  leadsBySource: { source: string; count: number }[]
  revenueByMonth: { month: string; revenue: number; newMrr: number; churnedMrr: number }[]
  pipelineValue: number
  pipelineByStage: { stage: string; value: number; count: number }[]
  topClients: { name: string; revenue: number; growth: number }[]
  taskStats: {
    total: number
    completed: number
    completionRate: number
    avgCompletionTime: number
  }
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      const [overview, leads, revenue, pipeline] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getLeads(),
        analyticsService.getRevenue(),
        analyticsService.getPipeline()
      ])
      
      setData({
        overview,
        ...leads,
        ...revenue,
        ...pipeline,
        topClients: [
          { name: 'Acme Corp', revenue: 45000, growth: 23 },
          { name: 'TechStart Inc', revenue: 32000, growth: 45 },
          { name: 'Global Systems', revenue: 28000, growth: -5 },
          { name: 'Innovate Labs', revenue: 24000, growth: 67 },
          { name: 'Future Dynamics', revenue: 19000, growth: 12 }
        ],
        taskStats: {
          total: 127,
          completed: 89,
          completionRate: 70,
          avgCompletionTime: 2.3
        }
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
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

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `$${(data?.overview.totalRevenue || 0).toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'MRR',
      value: `$${(data?.overview.mrr || 0).toLocaleString()}`,
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'Total Leads',
      value: (data?.overview.totalLeads || 0).toString(),
      change: '+24',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Conversion Rate',
      value: `${(data?.overview.conversionRate || 0).toFixed(1)}%`,
      change: '+2.3%',
      trend: 'up',
      icon: Target
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Track performance and growth metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#0f0f1b] border border-white/10 rounded-lg px-4 py-2 text-slate-300"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{metric.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                    {metric.change}
                  </span>
                  <span className="text-slate-500 ml-1 text-sm">vs last period</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10">
                <metric.icon className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue Overview</h2>
          <div className="h-64 flex items-end gap-2">
            {data?.revenueByMonth?.map((month, i) => {
              const max = Math.max(...(data?.revenueByMonth?.map(m => m.revenue) || [1]))
              const height = (month.revenue / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 opacity-0 hover:opacity-100 transition-opacity">
                      ${(month.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{month.month}</span>
                </div>
              )
            }) || (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                No revenue data
              </div>
            )}
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Lead Funnel</h2>
          <div className="space-y-4">
            {data?.leadsByStatus?.map((status) => (
              <div key={status.status} className="flex items-center gap-4">
                <div className="w-24 text-sm text-slate-400 capitalize">{status.status.replace('_', ' ')}</div>
                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg transition-all duration-500"
                    style={{ width: `${status.percentage}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white">
                    {status.count}
                  </span>
                </div>
                <div className="w-12 text-right text-slate-400 text-sm">{status.percentage}%</div>
              </div>
            )) || (
              <div className="text-center py-8 text-slate-500">No lead data</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Value */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Pipeline Value</h2>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-cyan-400">
              ${(data?.pipelineValue || 0).toLocaleString()}
            </p>
            <p className="text-slate-400 mt-1">Total pipeline</p>
          </div>
          <div className="space-y-3 mt-6">
            {data?.pipelineByStage?.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg">
                <span className="text-slate-300 capitalize">{stage.stage.replace('_', ' ')}</span>
                <div className="text-right">
                  <p className="font-medium text-white">${stage.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{stage.count} deals</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-slate-500">No pipeline data</div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Clients</h2>
          <div className="space-y-4">
            {data?.topClients?.map((client, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-medium text-sm">
                    {client.name[0]}
                  </div>
                  <span className="text-slate-300">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${(client.revenue / 1000).toFixed(0)}k</p>
                  <p className={`text-xs ${client.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {client.growth >= 0 ? '+' : ''}{client.growth}%
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-slate-500">No client data</div>
            )}
          </div>
        </div>

        {/* Task Performance */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Task Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-white">{data?.taskStats.total || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Total Tasks</p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-green-400">{data?.taskStats.completed || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Completed</p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-cyan-400">{data?.taskStats.completionRate || 0}%</p>
              <p className="text-sm text-slate-400 mt-1">Completion Rate</p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-400">{data?.taskStats.avgCompletionTime || 0}d</p>
              <p className="text-sm text-slate-400 mt-1">Avg. Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
