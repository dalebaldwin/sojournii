import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

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

  return useQuery(
    api.accountSettings.getAccountSettings,
    isAuthenticated ? undefined : 'skip'
  )
}

// Hook to get user's preferred timezone
export function useUserTimezone(): string {
  const accountSettings = useAccountSettings()

  // Return user's preferred timezone, fallback to browser-detected timezone
  return (
    accountSettings?.weekly_reminder_time_zone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'UTC'
  )
}

// Hook to check if user has completed onboarding
export function useOnboardingStatus() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(
    api.accountSettings.hasCompletedOnboarding,
    isAuthenticated ? undefined : 'skip'
  )
}

// Hook to get reminder preferences
export function useReminderPreferences() {
  const { isAuthenticated } = useConvexAuth()

  return useQuery(
    api.accountSettings.getAccountSettings,
    isAuthenticated ? undefined : 'skip'
  )
}

// Hook to create account settings
export function useCreateAccountSettings() {
  return useMutation(api.accountSettings.createAccountSettings)
}

// Hook to update account settings
export function useUpdateAccountSettings() {
  return useMutation(api.accountSettings.updateAccountSettings)
}

// Hook to delete account settings
export function useDeleteAccountSettings() {
  return useMutation(api.accountSettings.deleteAccountSettings)
}
