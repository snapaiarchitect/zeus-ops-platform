import { useState, useEffect } from 'react'
import { analyticsService } from '@/services/analytics.service'
import type { DashboardSummary } from '@/types/analytics'
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

export function AnalyticsPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setData(await analyticsService.getSummary())
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

  const exportCsv = () => {
    if (!data) return
    const rows = [
      ['metric', 'value'],
      ['total_leads', data.totalLeads], ['total_revenue', data.totalRevenue], ['mrr', data.mrr],
      ['conversion_rate_pct', data.conversionRate], ['pipeline_value', data.pipelineValue],
      ...data.pipelineByStage.map((p) => [`pipeline_${p.stage}`, p.value]),
    ]
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'zeus-ops-analytics.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `$${(data?.totalRevenue || 0).toLocaleString()}`,
      sub: 'Closed-won deal value',
      icon: DollarSign
    },
    {
      title: 'MRR',
      value: `$${(data?.mrr || 0).toLocaleString()}`,
      sub: 'Active subscriptions',
      icon: TrendingUp
    },
    {
      title: 'Total Leads',
      value: (data?.totalLeads || 0).toString(),
      sub: `${data?.newLeadsThisMonth || 0} new this month`,
      icon: Users
    },
    {
      title: 'Conversion Rate',
      value: `${(data?.conversionRate || 0).toFixed(1)}%`,
      sub: 'Won ÷ closed deals',
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
          <Button variant="outline" onClick={exportCsv}>
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
                <p className="text-slate-500 text-sm mt-2">{metric.sub}</p>
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
          <div className="h-64 flex items-stretch gap-2">
            {data?.revenueByMonth?.length ? data.revenueByMonth.map((month, i) => {
              const max = Math.max(1, ...(data?.revenueByMonth?.map(m => m.revenue) || [1]))
              const height = (month.revenue / max) * 100
              return (
                <div key={i} className="flex-1 min-w-0 flex flex-col items-center gap-2" title={`$${month.revenue.toLocaleString()}`}>
                  <span className="text-xs text-slate-300">${(month.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{month.month}</span>
                </div>
              )
            }) : (
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
            {data?.leadsByStatus?.length ? data.leadsByStatus.map((status) => (
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
            )) : (
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
            {data?.pipelineByStage?.length ? data.pipelineByStage.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg">
                <span className="text-slate-300 capitalize">{stage.stage.replace('_', ' ')}</span>
                <div className="text-right">
                  <p className="font-medium text-white">${stage.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{stage.count} deals</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-slate-500">No pipeline data</div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Clients</h2>
          <div className="space-y-4">
            {data?.topClients?.length ? data.topClients.map((client, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0a0a0f] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-medium text-sm">
                    {client.name[0]}
                  </div>
                  <span className="text-slate-300">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${(client.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-slate-500">No client data</div>
            )}
          </div>
        </div>

        {/* Task Performance */}
        <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Task Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-white">{data?.taskStats.total ?? 0}</p>
              <p className="text-sm text-slate-400 mt-1">Total Tasks</p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-green-400">{data?.taskStats.completed ?? 0}</p>
              <p className="text-sm text-slate-400 mt-1">Completed</p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
              <p className="text-3xl font-bold text-cyan-400">{data?.taskStats.completionRate ?? 0}%</p>
              <p className="text-sm text-slate-400 mt-1">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
