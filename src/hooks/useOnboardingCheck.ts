'use client'

import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccountSettings } from './useAccountSettings'

export function useOnboardingCheck() {
  const { user, isLoaded: clerkLoaded } = useUser()
  const { isAuthenticated } = useConvexAuth()
  const router = useRouter()
  const accountSettings = useAccountSettings()

  const [isLoading, setIsLoading] = useState(true)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    // Wait for Clerk to load
    if (!clerkLoaded) {
      return
    }

    // If user is not authenticated with Clerk, redirect to sign-in
    if (!user) {
      setIsLoading(false)
      router.push('/sign-in')
      return
    }

    // Wait for Convex authentication and account settings to load
    if (!isAuthenticated || accountSettings === undefined) {
      return
    }

    // If user has no account settings, they need to complete onboarding
    if (!accountSettings) {
      setIsLoading(false)
      router.push('/my/welcome')
      return
    }

    // If user has account settings but onboarding is not completed
    if (!accountSettings.onboarding_completed) {
      setIsLoading(false)
      router.push('/my/welcome')
      return
    }

    // User has completed onboarding
    setHasCompletedOnboarding(true)
    setIsLoading(false)
  }, [clerkLoaded, user, isAuthenticated, accountSettings, router])

  return {
    isLoading,
    hasCompletedOnboarding,
    user,
    accountSettings,
  }
}
