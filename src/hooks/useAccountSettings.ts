import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useConvexAuth } from 'convex/react'

// Query key factory for account settings
const accountSettingsKeys = {
  all: ['accountSettings'] as const,
  current: () => [...accountSettingsKeys.all, 'current'] as const,
  onboarding: () => [...accountSettingsKeys.all, 'onboarding'] as const,
  reminders: () => [...accountSettingsKeys.all, 'reminders'] as const,
}

// Hook to get current user's account settings
export function useAccountSettings() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery({
    queryKey: accountSettingsKeys.current(),
    queryFn: async () => {
      // This would be called by your API layer
      // For now, we'll return null as Convex handles the query
      return null
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to check if user has completed onboarding
export function useOnboardingStatus() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery({
    queryKey: accountSettingsKeys.onboarding(),
    queryFn: async () => {
      // This would be called by your API layer
      return false
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get reminder preferences
export function useReminderPreferences() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery({
    queryKey: accountSettingsKeys.reminders(),
    queryFn: async () => {
      // This would be called by your API layer
      return null
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to create account settings
export function useCreateAccountSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_data: {
      email: string
      onboarding_completed: boolean
      weekly_reminder: boolean
      weekly_reminder_hour: number
      weekly_reminder_minute: number
      weekly_reminder_day:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
      weekly_reminder_time_zone: string
    }) => {
      // This would be called by your API layer
      // For now, we'll return a mock ID
      return 'mock-id'
    },
    onSuccess: () => {
      // Invalidate and refetch account settings
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.all })
    },
  })
}

// Hook to update account settings
export function useUpdateAccountSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      email?: string
      onboarding_completed?: boolean
      weekly_reminder?: boolean
      weekly_reminder_hour?: number
      weekly_reminder_minute?: number
      weekly_reminder_day?:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday'
      weekly_reminder_time_zone?: string
    }) => {
      // This would be called by your API layer
      return data.id
    },
    onSuccess: () => {
      // Invalidate and refetch account settings
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.all })
    },
  })
}

// Hook to delete account settings
export function useDeleteAccountSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (_id: string) => {
      // This would be called by your API layer
      return true
    },
    onSuccess: () => {
      // Invalidate and refetch account settings
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.all })
    },
  })
}
