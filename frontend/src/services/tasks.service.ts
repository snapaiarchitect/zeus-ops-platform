import { api } from './api'
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus } from '@/types/task'

export const tasksService = {
  async getAll(params?: { status?: TaskStatus; priority?: string; assignedTo?: string }): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks', { params })
    return response.data
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  async create(data: CreateTaskData): Promise<Task> {
    const response = await api.post<Task>('/tasks', data)
    return response.data
  },

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/status`, { status })
    return response.data
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get<Task[]>('/tasks/my-tasks')
    return response.data
  },
}
