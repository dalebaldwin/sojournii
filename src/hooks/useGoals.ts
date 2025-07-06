import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

// Query key factory for goals
const goalsKeys = {
  all: ['goals'] as const,
  user: () => [...goalsKeys.all, 'user'] as const,
  detail: (id: string) => [...goalsKeys.all, 'detail', id] as const,
  milestones: (goalId: string) =>
    [...goalsKeys.all, 'milestones', goalId] as const,
}

// Hook to get current user's goals
export function useUserGoals() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(api.goals.getUserGoals, isAuthenticated ? undefined : 'skip')
}

// Hook to get a specific goal
export function useGoal(goalId: Id<'goals'> | undefined) {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(
    api.goals.getGoal,
    isAuthenticated && goalId ? { goalId } : 'skip'
  )
}

// Hook to get milestones for a goal
export function useGoalMilestones(goalId: Id<'goals'> | undefined) {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(
    api.goals.getGoalMilestones,
    isAuthenticated && goalId ? { goalId } : 'skip'
  )
}

// Hook to create a goal
export function useCreateGoal() {
  return useMutation(api.goals.createGoal)
}

// Hook to update a goal
export function useUpdateGoal() {
  return useMutation(api.goals.updateGoal)
}

// Hook to delete a goal
export function useDeleteGoal() {
  return useMutation(api.goals.deleteGoal)
}

// Hook to create a milestone
export function useCreateMilestone() {
  return useMutation(api.goals.createMilestone)
}

// Hook to update a milestone
export function useUpdateMilestone() {
  return useMutation(api.goals.updateMilestone)
}

// Hook to delete a milestone
export function useDeleteMilestone() {
  return useMutation(api.goals.deleteMilestone)
}

// Hook to create goal with milestones (for guided flow)
export function useCreateGoalWithMilestones() {
  return useMutation(api.goals.createGoalWithMilestones)
}
