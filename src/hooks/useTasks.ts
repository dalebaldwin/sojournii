import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Task {
  _id: Id<'tasks'>
  user_id: string
  title: string
  description: string
  due_date?: number
  status: TaskStatus
  completion_date?: number
  created_at: number
  updated_at: number
}

// Hook to get all tasks
export function useTasks(status?: TaskStatus) {
  return useQuery(api.tasks.listTasks, status ? { status } : {})
}

// Hook to get a specific task
export function useTask(taskId: Id<'tasks'>) {
  return useQuery(api.tasks.getTask, { id: taskId })
}

// Hook to create a new task
export function useCreateTask() {
  return useMutation(api.tasks.createTask)
}

// Hook to update a task
export function useUpdateTask() {
  return useMutation(api.tasks.updateTask)
}

// Hook to delete a task
export function useDeleteTask() {
  return useMutation(api.tasks.deleteTask)
}

// Hook to mark a task as completed
export function useMarkTaskCompleted() {
  return useMutation(api.tasks.markTaskCompleted)
}

// Hook to get tasks by date range
export function useTasksByDateRange(startDate: number, endDate: number) {
  return useQuery(api.tasks.getTasksByDateRange, { startDate, endDate })
}
