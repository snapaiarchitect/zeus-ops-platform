import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  CreditCard,
  HelpCircle,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { tasksService } from '@/services/tasks.service'
import { billingService, type BillingSubscription } from '@/services/billing.service'
import type { Task } from '@/types/task'

export function ClientOverviewPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, billing] = await Promise.all([tasksService.getMyTasks(), billingService.getOverview()])
        setTasks(tasksData)
        setSubscription(billing.subscription)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const recentTasks = [...tasks].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5)
  const pendingTasks = tasks.filter((t) => t.status !== 'done')
  const completedTasks = tasks.filter((t) => t.status === 'done')

  const stats = [
    {
      label: 'Pending Tasks',
      value: pendingTasks.length.toString(),
      change: `${tasks.length > 0 ? Math.round((pendingTasks.length / tasks.length) * 100) : 0}%`,
      icon: CheckSquare,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Completed',
      value: completedTasks.length.toString(),
      change: 'This month',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'In Progress',
      value: tasks.filter((t) => t.status === 'in_progress').length.toString(),
      change: 'Being worked on',
      icon: Calendar,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Next Bill',
      value: subscription ? `$${Number(subscription.amount).toLocaleString()}` : '—',
      change: subscription ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : 'No active plan',
      icon: CreditCard,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  const quickActions = [
    {
      label: 'View Tasks',
      description: 'Check your pending and completed tasks',
      icon: CheckSquare,
      href: '/dashboard/tasks',
      color: 'text-cyan-400',
    },
    {
      label: 'Manage Billing',
      description: 'Update payment method and view invoices',
      icon: CreditCard,
      href: '/dashboard/billing',
      color: 'text-purple-400',
    },
    {
      label: 'Get Support',
      description: 'Submit a ticket or browse help articles',
      icon: HelpCircle,
      href: '/dashboard/support',
      color: 'text-green-400',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening.</p>
        </div>
        <Link to="/dashboard/tasks">
          <Button className="gap-2">
            <Zap className="w-4 h-4" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Recent Tasks</h2>
              <Link
                to="/dashboard/tasks"
                className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No tasks yet</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Your tasks will appear here once assigned
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === 'done'
                            ? 'bg-green-500'
                            : task.status === 'in_progress'
                            ? 'bg-cyan-500'
                            : 'bg-yellow-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{task.title}</p>
                        <p className="text-slate-400 text-sm">
                          {task.status.replace('_', ' ')} • Due{' '}
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : 'No date'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-red-500/20 text-red-400'
                            : task.priority === 'high'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Updates</h2>
            {recentTasks.length ? (
              <div className="space-y-4">
                {recentTasks.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{activity.title}</p>
                      <p className="text-slate-400 text-xs capitalize">{activity.status.replace('_', ' ')} · {activity.priority} priority</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {new Date(activity.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-cyan-400 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-slate-400 text-xs">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white">Professional Plan</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Your plan renews on April 28, 2026
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">AI Agents</span>
                <span className="text-white">12/20 used</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-cyan-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tasks</span>
                <span className="text-white">6,240/10,000</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-cyan-500 rounded-full" />
              </div>
            </div>
            <Link to="/dashboard/billing">
              <Button variant="outline" size="sm" className="w-full">
                Manage Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
