import { api, clean } from './api'
import type { Task, TaskInput, TaskFilters, TaskStatus } from '@/types/task'
import type { Pagination } from '@/types/crm'

export const tasksService = {
  async getAll(params?: TaskFilters): Promise<{ tasks: Task[]; pagination: Pagination }> {
    const { data } = await api.get('/tasks', { params: { limit: 100, ...params } })
    return data
  },
  async create(input: TaskInput): Promise<Task> {
    const { data } = await api.post<{ task: Task }>('/tasks', clean(input))
    return data.task
  },
  async update(id: string, input: Partial<TaskInput>): Promise<Task> {
    const { data } = await api.patch<{ task: Task }>(`/tasks/${id}`, clean(input))
    return data.task
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },

  // Tasks assigned to / raised by the current user (clients and staff)
  async getMyTasks(): Promise<Task[]> {
    const { data } = await api.get<{ tasks: Task[] }>('/tasks/my/tasks', { params: { limit: 50 } })
    return data.tasks
  },
  async createMine(input: Pick<TaskInput, 'title' | 'description' | 'priority' | 'dueDate'>): Promise<Task> {
    const { data } = await api.post<{ task: Task }>('/tasks/my', clean(input))
    return data.task
  },
  async updateMyStatus(id: string, status: TaskStatus): Promise<Task> {
    const { data } = await api.patch<{ task: Task }>(`/tasks/my/${id}/status`, { status })
    return data.task
  },
}
