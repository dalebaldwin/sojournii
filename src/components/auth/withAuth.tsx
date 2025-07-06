import { useAuthCheck } from '@/hooks/useAuthCheck'
import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface WithAuthProps {
  children: React.ReactNode
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { user, isLoaded } = useUser()
    const { isAuthenticated } = useConvexAuth()
    const router = useRouter()

    useEffect(() => {
      // Wait for Clerk to load
      if (!isLoaded) {
        return
      }

      // If user is not authenticated, redirect to sign-in
      if (!user || !isAuthenticated) {
        router.push('/sign-in')
        return
      }
    }, [isLoaded, user, isAuthenticated, router])

    // Show loading while checking auth
    if (!isLoaded || !user || !isAuthenticated) {
      return (
        <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
          Loading...
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

// Alternative: A component wrapper for more complex auth logic
export function AuthGuard({ children }: WithAuthProps) {
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuthCheck()

  if (isLoading) {
    return (
      <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated || !hasCompletedOnboarding) {
    return null // Will redirect via useAuthCheck
  }

  return <>{children}</>
}
