export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = 'client_work' | 'internal' | 'business_dev' | 'admin'

export interface Task {
  id: string
  userId: string
  assignedTo?: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  dueDate?: string
  estimatedHours?: number | string
  actualHours?: number | string
  clientId?: string
  leadId?: string
  tags: string[]
  attachments?: string[]
  completedAt?: string
  assignee?: { id: string; firstName: string; lastName: string; email: string }
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  category?: TaskCategory
  assignedTo?: string
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
}

export interface TaskFilters {
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  search?: string
  page?: number
  limit?: number
}
