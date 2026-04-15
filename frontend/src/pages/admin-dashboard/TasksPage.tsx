import { useState, useEffect } from 'react'
import { tasksService } from '@/services/tasks.service'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { DataTable } from '@/components/ui/DataTable'
import { 
  Plus, 
  Search,
  Filter,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  PauseCircle,
  User,
  Calendar,
  Tag
} from 'lucide-react'

const TASK_STATUSES: { id: TaskStatus; label: string; icon: typeof Circle; color: string }[] = [
  { id: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-400' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-cyan-400' },
  { id: 'review', label: 'Review', icon: AlertCircle, color: 'text-yellow-400' },
  { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-400' },
  { id: 'blocked', label: 'Blocked', icon: PauseCircle, color: 'text-red-400' }
]

const PRIORITY_COLORS = {
  low: 'text-green-400 bg-green-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  high: 'text-orange-400 bg-orange-500/10',
  urgent: 'text-red-400 bg-red-500/10'
}

const CATEGORIES = [
  { id: 'client_work', label: 'Client Work' },
  { id: 'internal', label: 'Internal' },
  { id: 'business_dev', label: 'Business Dev' },
  { id: 'admin', label: 'Admin' }
]

export function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  })

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    category: 'internal' as const,
    dueDate: '',
    estimatedHours: '',
    assignedTo: ''
  })

  useEffect(() => {
    loadTasks()
  }, [filters])

  const loadTasks = async () => {
    try {
      const data = await tasksService.getAll(filters)
      setTasks(data.tasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    try {
      await tasksService.create({
        ...newTask,
        estimatedHours: newTask.estimatedHours ? parseFloat(newTask.estimatedHours) : undefined
      })
      setIsCreateOpen(false)
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        category: 'internal',
        dueDate: '',
        estimatedHours: '',
        assignedTo: ''
      })
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksService.update(taskId, { status: newStatus })
      loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const filteredTasks = tasks.filter(task =>
    searchQuery === '' ||
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const columns = [
    {
      key: 'task',
      header: 'Task',
      render: (task: Task) => (
        <div>
          <p className="font-medium text-white">{task.title}</p>
          <p className="text-sm text-slate-500 line-clamp-1">{task.description || '-'}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (task: Task) => {
        const statusConfig = TASK_STATUSES.find(s => s.id === task.status)
        return (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
            className={`text-sm px-3 py-1 rounded-full bg-[#0a0a0f] border border-white/10 ${statusConfig?.color} focus:outline-none focus:border-cyan-500/50 cursor-pointer`}
          >
            {TASK_STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        )
      }
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (task: Task) => (
        <span className={`text-xs px-2 py-1 rounded-full border border-white/10 ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (task: Task) => (
        <span className="text-slate-400 text-sm">
          {CATEGORIES.find(c => c.id === task.category)?.label || task.category}
        </span>
      )
    },
    {
      key: 'due',
      header: 'Due Date',
      render: (task: Task) => {
        if (!task.dueDate) return <span className="text-slate-500">-</span>
        const due = new Date(task.dueDate)
        const isOverdue = due < new Date() && task.status !== 'done'
        return (
          <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
            <Calendar className="w-3 h-3" />
            {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )
      }
    },
    {
      key: 'time',
      header: 'Est. Hours',
      render: (task: Task) => (
        <span className="text-slate-400 text-sm">
          {task.estimatedHours ? `${task.estimatedHours}h` : '-'}
          {task.actualHours && ` / ${task.actualHours}h`}
        </span>
      )
    }
  ]

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false
      return new Date(t.dueDate) < new Date()
    }).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-1">Manage team workload and assignments</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{taskStats.total}</p>
          <p className="text-xs text-slate-400 mt-1">Total</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-400">{taskStats.todo}</p>
          <p className="text-xs text-slate-400 mt-1">To Do</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{taskStats.inProgress}</p>
          <p className="text-xs text-slate-400 mt-1">In Progress</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{taskStats.review}</p>
          <p className="text-xs text-slate-400 mt-1">Review</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{taskStats.done}</p>
          <p className="text-xs text-slate-400 mt-1">Done</p>
        </div>
        <div className="bg-[#0f0f1b] border border-white/10 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{taskStats.blocked}</p>
          <p className="text-xs text-slate-400 mt-1">Blocked</p>
        </div>
        <div className="bg-[#0f0f1b] border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{taskStats.overdue}</p>
          <p className="text-xs text-red-400 mt-1">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-[#0f0f1b] border border-white/10 rounded-lg px-4 py-2 text-slate-300"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="bg-[#0f0f1b] border border-white/10 rounded-lg px-4 py-2 text-slate-300"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Tasks Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTasks}
          keyExtractor={(task) => task.id}
        />
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full h-24 bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
              >
                {TASK_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 text-slate-300"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                placeholder="Due Date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Est. Hours"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateTask} className="flex-1">
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
