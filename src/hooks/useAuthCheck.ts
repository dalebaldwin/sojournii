import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccountSettings } from './useAccountSettings'

export function useAuthCheck() {
  const { user, isLoaded: clerkLoaded } = useUser()
  const { isAuthenticated: convexAuthenticated } = useConvexAuth()
  const router = useRouter()
  const accountSettings = useAccountSettings()

  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    // Wait for Clerk to load
    if (!clerkLoaded) {
      return
    }

    // If user is not authenticated, redirect to sign-in
    if (!user || !convexAuthenticated) {
      router.push('/sign-in')
      return
    }

    // Wait for account settings to load
    if (accountSettings === undefined) {
      return
    }

    // If user has no account settings, they need to complete onboarding
    if (!accountSettings) {
      router.push('/my/welcome')
      return
    }

    // If user has account settings but onboarding is not completed
    if (!accountSettings.onboarding_completed) {
      router.push('/my/welcome')
      return
    }

    // User is authenticated and has completed onboarding
    setIsAuthenticated(true)
    setHasCompletedOnboarding(true)
    setIsLoading(false)
  }, [clerkLoaded, user, convexAuthenticated, accountSettings, router])

  return {
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    user,
    accountSettings,
  }
}
