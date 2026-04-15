import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Filter,
  Search,
  CheckSquare,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  User,
  Tag,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { tasksService } from '@/services/tasks.service'
import type { Task, TaskStatus, TaskPriority } from '@/types/task'

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-cyan-500' },
  { value: 'review', label: 'Review', color: 'bg-yellow-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' },
]

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
]

export function ClientTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('created')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await tasksService.getMyTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return

    try {
      await tasksService.create({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
      })
      setIsCreateDialogOpen(false)
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await tasksService.updateStatus(taskId, status)
      loadTasks()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-slate-400">Manage your tasks and track progress</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'all', label: 'All Tasks', count: taskCounts.all },
          { key: 'todo', label: 'To Do', count: taskCounts.todo },
          { key: 'in_progress', label: 'In Progress', count: taskCounts.in_progress },
          { key: 'review', label: 'Review', count: taskCounts.review },
          { key: 'done', label: 'Done', count: taskCounts.done },
        ].map((stat) => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key as TaskStatus | 'all')}
            className={`p-4 rounded-xl border transition-colors ${
              statusFilter === stat.key
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className="text-2xl font-bold text-white">{stat.count}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="created">Sort by Created</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tasks found</p>
            <p className="text-slate-500 text-sm mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Status Checkbox */}
                  <button
                    onClick={() =>
                      handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')
                    }
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-600 hover:border-cyan-500'
                    }`}
                  >
                    {task.status === 'done' && (
                      <CheckSquare className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`font-medium ${
                            task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {/* Status Badge */}
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                        className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Priority */}
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          priorityOptions.find((p) => p.value === task.priority)?.color
                        }`}
                      >
                        <AlertCircle className="w-3 h-3" />
                        {task.priority}
                      </span>

                      {/* Due Date */}
                      {task.dueDate && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            new Date(task.dueDate) < new Date() && task.status !== 'done'
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      {/* Tags */}
                      {task.tags?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-slate-500">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assigned */}
                      {task.assignedToName && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value as TaskPriority })
                  }
                  className="w-full h-9 rounded-md border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
