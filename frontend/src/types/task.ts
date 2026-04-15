export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  assignedToName?: string
  createdBy: string
  dueDate?: string
  tags: string[]
  attachments?: string[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: string
  tags?: string[]
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: string
  tags?: string[]
}
