import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function WelcomePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mb-12 text-center'>
        <h1 className='font-display text-foreground mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl'>
          Welcome to Sojournii! 🎉
        </h1>
        <p className='text-muted-foreground mx-auto max-w-2xl font-sans text-xl'>
          Your account has been created successfully. Let&apos;s get you started
          on your journey.
        </p>
      </div>

      <div className='bg-card mb-8 rounded-xl border p-8 shadow-lg'>
        <div className='mb-8 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
            <svg
              className='h-8 w-8 text-green-600 dark:text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h2 className='font-display text-foreground mb-2 text-2xl font-semibold'>
            Account Created Successfully
          </h2>
          <p className='text-muted-foreground font-sans'>
            You&apos;re all set up and ready to explore your personalized
            dashboard.
          </p>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='bg-accent rounded-lg p-6 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
              <svg
                className='h-6 w-6 text-blue-600 dark:text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='font-display text-foreground mb-2 text-lg font-semibold'>
              Secure Access
            </h3>
            <p className='text-muted-foreground font-sans text-sm'>
              Your account is protected with industry-standard security.
            </p>
          </div>

          <div className='bg-accent rounded-lg p-6 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
              <svg
                className='h-6 w-6 text-purple-600 dark:text-purple-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='font-display text-foreground mb-2 text-lg font-semibold'>
              Fast & Reliable
            </h3>
            <p className='text-muted-foreground font-sans text-sm'>
              Built with modern technology for the best performance.
            </p>
          </div>

          <div className='bg-accent rounded-lg p-6 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
              <svg
                className='h-6 w-6 text-green-600 dark:text-green-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                />
              </svg>
            </div>
            <h3 className='font-display text-foreground mb-2 text-lg font-semibold'>
              Personalized
            </h3>
            <p className='text-muted-foreground font-sans text-sm'>
              Your experience is tailored just for you.
            </p>
          </div>
        </div>

        <div className='text-center'>
          <Link
            href='/my'
            className='text-primary-foreground bg-primary hover:bg-primary/90 inline-flex items-center rounded-lg border border-transparent px-8 py-4 text-lg font-medium shadow-sm transition-colors'
          >
            Go to Dashboard
            <svg
              className='ml-2 h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7l5 5m0 0l-5 5m5-5H6'
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className='text-center'>
        <p className='text-muted-foreground font-sans text-sm'>
          Need help? Check out our{' '}
          <a href='#' className='text-primary hover:text-primary/90 underline'>
            getting started guide
          </a>
          .
        </p>
      </div>
    </div>
  )
}
