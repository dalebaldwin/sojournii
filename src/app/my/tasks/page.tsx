'use client'

import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateTask,
  useDeleteTask,
  useMarkTaskCompleted,
  useTasks,
  useUpdateTask,
  type Task,
  type TaskStatus,
} from '@/hooks/useTasks'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Edit3,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

const statusConfig = {
  pending: { label: 'Pending', icon: Circle, color: 'text-gray-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-500' },
}

interface TaskFormData {
  title: string
  description: string
  due_date?: Date
  status: TaskStatus
}

export default function TasksPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
  })

  // Get tasks based on filter
  const tasks = useTasks(filterStatus === 'all' ? undefined : filterStatus)

  // Mutations
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const markCompleted = useMarkTaskCompleted()

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return

    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date?.getTime(),
        status: formData.status,
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'pending',
      })
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask || !formData.title.trim()) return

    try {
      await updateTask({
        id: editingTask._id,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date?.getTime(),
        status: formData.status,
      })

      setEditingTask(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId: Task['_id']) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask({ id: taskId })
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleMarkCompleted = async (
    taskId: Task['_id'],
    completionDate?: Date
  ) => {
    try {
      await markCompleted({
        id: taskId,
        completion_date: completionDate?.getTime(),
      })
    } catch (error) {
      console.error('Failed to mark task as completed:', error)
    }
  }

  const startEditing = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      status: task.status,
    })
    setIsCreating(false)
  }

  const startCreating = () => {
    setIsCreating(true)
    setEditingTask(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
    })
  }

  const cancelEditing = () => {
    setIsCreating(false)
    setEditingTask(null)
    resetForm()
  }

  // Calculate task statistics
  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
    in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    overdue:
      tasks?.filter(
        t => t.due_date && t.due_date < Date.now() && t.status !== 'completed'
      ).length || 0,
  }

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-6'>
      {/* Header */}
      <PageHeader
        title='Tasks'
        description='Manage your tasks and track your productivity'
      />

      {/* Task Statistics Dashboard */}
      <div className='bg-muted/30 rounded-lg p-6'>
        <div className='mb-4'>
          <h2 className='text-lg font-semibold'>Task Overview</h2>
          <p className='text-muted-foreground text-sm'>
            Your task analytics and progress
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
          {/* Total Tasks */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
              <span className='text-sm font-medium'>Total</span>
            </div>
            <div className='text-2xl font-bold'>{taskStats.total}</div>
          </div>

          {/* Pending Tasks */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-gray-500'></div>
              <span className='text-sm font-medium'>Pending</span>
            </div>
            <div className='text-2xl font-bold'>{taskStats.pending}</div>
          </div>

          {/* In Progress Tasks */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
              <span className='text-sm font-medium'>In Progress</span>
            </div>
            <div className='text-2xl font-bold'>{taskStats.in_progress}</div>
          </div>

          {/* Completed Tasks */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-green-500'></div>
              <span className='text-sm font-medium'>Completed</span>
            </div>
            <div className='text-2xl font-bold'>{taskStats.completed}</div>
          </div>

          {/* Overdue Tasks */}
          <div className='bg-background rounded-lg p-4'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-red-500'></div>
              <span className='text-sm font-medium'>Overdue</span>
            </div>
            <div className='text-2xl font-bold'>{taskStats.overdue}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Select
            value={filterStatus}
            onValueChange={value =>
              setFilterStatus(value as TaskStatus | 'all')
            }
          >
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Tasks</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='cancelled'>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={startCreating} className='flex items-center space-x-2'>
          <Plus className='h-4 w-4' />
          <span>New Task</span>
        </Button>
      </div>

      {/* Task Form */}
      {(isCreating || editingTask) && (
        <div className='space-y-4 rounded-lg border p-6'>
          <h3 className='text-lg font-semibold'>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='md:col-span-2'>
              <label className='text-sm font-medium'>Title</label>
              <Input
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder='Enter task title...'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='text-sm font-medium'>Description</label>
              <Textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Enter task description...'
                rows={3}
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Due Date</label>
              <DatePicker
                date={formData.due_date}
                onDateChange={date =>
                  setFormData({ ...formData, due_date: date })
                }
                placeholder='Select due date'
              />
            </div>

            <div>
              <label className='text-sm font-medium'>Status</label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData({ ...formData, status: value as TaskStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='in_progress'>In Progress</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
            <Button variant='outline' onClick={cancelEditing}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className='space-y-4'>
        {tasks?.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            <div className='space-y-2'>
              <div className='text-4xl'>📋</div>
              <div>No tasks found</div>
              <div className='text-sm'>
                Click &ldquo;New Task&rdquo; to get started
              </div>
            </div>
          </div>
        ) : (
          tasks?.map(task => {
            const StatusIcon = statusConfig[task.status].icon
            const isOverdue =
              task.due_date &&
              task.due_date < Date.now() &&
              task.status !== 'completed'

            return (
              <div
                key={task._id}
                className={`rounded-lg border p-4 transition-colors ${isOverdue ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20' : 'border-border'} ${task.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center gap-3'>
                      <StatusIcon
                        className={`h-5 w-5 ${statusConfig[task.status].color}`}
                      />
                      <h3
                        className={`font-semibold ${task.status === 'completed' ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {task.title}
                      </h3>
                      {isOverdue && (
                        <span className='rounded-full bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200'>
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p
                        className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground' : 'text-foreground'}`}
                      >
                        {task.description}
                      </p>
                    )}

                    <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                      <span className='flex items-center gap-1'>
                        Status:{' '}
                        <span className={statusConfig[task.status].color}>
                          {statusConfig[task.status].label}
                        </span>
                      </span>

                      {task.due_date && (
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-4 w-4' />
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}

                      {task.completion_date && (
                        <span className='flex items-center gap-1 text-green-600 dark:text-green-400'>
                          <CheckCircle className='h-4 w-4' />
                          Completed:{' '}
                          {format(
                            new Date(task.completion_date),
                            'MMM d, yyyy'
                          )}
                        </span>
                      )}

                      <span>
                        Created:{' '}
                        {formatDistanceToNow(new Date(task.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {task.status !== 'completed' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleMarkCompleted(task._id, new Date())
                        }
                        className='flex items-center space-x-1'
                      >
                        <CheckCircle className='h-4 w-4' />
                        <span>Complete</span>
                      </Button>
                    )}

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => startEditing(task)}
                      className='flex items-center space-x-1'
                    >
                      <Edit3 className='h-4 w-4' />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteTask(task._id)}
                      className='flex items-center space-x-1 text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
