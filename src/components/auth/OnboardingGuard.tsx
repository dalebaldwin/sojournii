import { useOnboardingCheck } from '@/hooks/useOnboardingCheck'

interface OnboardingGuardProps {
  children: React.ReactNode
  skipOnboardingCheck?: boolean
}

export function OnboardingGuard({
  children,
  skipOnboardingCheck = false,
}: OnboardingGuardProps) {
  const { isLoading, hasCompletedOnboarding } = useOnboardingCheck()

  // Skip the check if explicitly requested
  if (skipOnboardingCheck) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  if (!hasCompletedOnboarding) {
    return null // Will redirect to welcome via useOnboardingCheck
  }

  return <>{children}</>
}
