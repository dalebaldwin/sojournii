import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-bold tracking-tight text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <div className='mt-8'>
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-lg border-0',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton:
                  'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                formButtonPrimary: 'bg-[#6c47ff] hover:bg-[#5a3fd8] text-white',
                footerActionLink: 'text-[#6c47ff] hover:text-[#5a3fd8]',
                dividerLine: 'bg-gray-300',
                dividerText: 'text-gray-500',
              },
            }}
            redirectUrl='/my'
            signUpUrl='/sign-up'
          />
        </div>
      </div>
    </div>
  )
}
