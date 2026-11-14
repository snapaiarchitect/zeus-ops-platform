import { useState, useEffect } from 'react'
import { analyticsService } from '@/services/analytics.service'
import type { TeamMemberStats } from '@/types/analytics'
import { Button } from '@/components/ui/Button'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Target,
  TrendingUp,
  Calendar,
  Mail
} from 'lucide-react'

export function TeamPage() {
  const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<TeamMemberStats | null>(null)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      setTeamStats(await analyticsService.getTeam())
    } catch (error) {
      console.error('Failed to load team data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const teamTotals = {
    totalMembers: teamStats.length,
    totalTasks: teamStats.reduce((sum, m) => sum + m.totalTasks, 0),
    completedTasks: teamStats.reduce((sum, m) => sum + m.completedTasks, 0),
    totalHours: teamStats.reduce((sum, m) => sum + m.hoursLogged, 0),
    avgEfficiency: Math.round(teamStats.reduce((sum, m) => sum + m.efficiency, 0) / (teamStats.length || 1))
  }

  const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0)

  const getWorkloadColor = (tasks: number) => {
    if (tasks < 5) return 'text-green-400'
    if (tasks < 10) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Team</h1>
          <p className="text-slate-400 mt-1">Manage team workload and performance</p>
        </div>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Message All
        </Button>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{teamTotals.totalMembers}</p>
          <p className="text-xs text-slate-400 mt-1">Team Members</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{teamTotals.totalTasks}</p>
          <p className="text-xs text-slate-400 mt-1">Tasks Assigned</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{teamTotals.completedTasks}</p>
          <p className="text-xs text-slate-400 mt-1">Completed</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{teamTotals.totalHours}</p>
          <p className="text-xs text-slate-400 mt-1">Hours Logged</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{teamTotals.avgEfficiency}%</p>
          <p className="text-xs text-slate-400 mt-1">Avg Efficiency</p>
        </div>
      </div>

      {/* Team Members Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamStats.map((member) => (
            <div
              key={member.user.id}
              className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-medium text-lg">
                    {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{member.user.firstName} {member.user.lastName}</h3>
                    <p className="text-sm text-slate-400">{member.user.email}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs border ${
                  member.overdueTasks > 0 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>
                  {member.overdueTasks > 0 ? `${member.overdueTasks} overdue` : 'On Track'}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-[#0a0a0f] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Target className="w-3 h-3" />
                    Total Tasks
                  </div>
                  <p className="text-lg font-semibold text-white">{member.totalTasks}</p>
                </div>
                <div className="p-3 bg-[#0a0a0f] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </div>
                  <p className="text-lg font-semibold text-green-400">{member.completedTasks}</p>
                </div>
                <div className="p-3 bg-[#0a0a0f] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    In Progress
                  </div>
                  <p className={`text-lg font-semibold ${getWorkloadColor(member.inProgressTasks)}`}>
                    {member.inProgressTasks}
                  </p>
                </div>
                <div className="p-3 bg-[#0a0a0f] rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Efficiency
                  </div>
                  <p className="text-lg font-semibold text-cyan-400">{member.efficiency}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Task Completion</span>
                  <span className="text-white">
                    {member.efficiency}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                    style={{ width: `${pct(member.completedTasks, member.totalTasks)}%` }}
                  />
                </div>
              </div>

              {/* Hours */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  Hours Logged
                </div>
                <span className="text-white font-medium">{member.hoursLogged}h</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workload Distribution */}
      <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Workload Distribution</h2>
        <div className="space-y-4">
          {teamStats.map((member) => (
            <div key={member.user.id} className="flex items-center gap-4">
              <div className="w-32 text-sm text-slate-300">
                {member.user.firstName} {member.user.lastName}
              </div>
              <div className="flex-1 h-10 bg-white/5 rounded-lg overflow-hidden flex">
                <div
                  className="h-full bg-green-500/60"
                  style={{ width: `${pct(member.completedTasks, member.totalTasks)}%` }}
                  title={`Completed: ${member.completedTasks}`}
                />
                <div
                  className="h-full bg-cyan-500/60"
                  style={{ width: `${pct(member.inProgressTasks, member.totalTasks)}%` }}
                  title={`In Progress: ${member.inProgressTasks}`}
                />
                <div
                  className="h-full bg-slate-500/40"
                  style={{ width: `${pct(member.totalTasks - member.completedTasks - member.inProgressTasks, member.totalTasks)}%` }}
                  title={`Remaining: ${member.totalTasks - member.completedTasks - member.inProgressTasks}`}
                />
              </div>
              <div className="w-20 text-right text-sm text-slate-400">
                {member.totalTasks} tasks
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/60" />
            <span className="text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-500/60" />
            <span className="text-slate-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-500/40" />
            <span className="text-slate-400">Todo</span>
          </div>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f1b] border border-white/10 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {selectedMember.user.firstName} {selectedMember.user.lastName}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{selectedMember.totalTasks}</p>
                <p className="text-sm text-slate-400">Total Tasks</p>
              </div>
              <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">{selectedMember.completedTasks}</p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
              <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-400">{selectedMember.hoursLogged}h</p>
                <p className="text-sm text-slate-400">Hours Logged</p>
              </div>
              <div className="p-4 bg-[#0a0a0f] rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-400">{selectedMember.efficiency}%</p>
                <p className="text-sm text-slate-400">Efficiency</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => window.location.href = `mailto:${selectedMember.user.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
