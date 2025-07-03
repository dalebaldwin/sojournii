import { Heading } from '@/components/ui/heading'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className='bg-background min-h-screen py-12'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        {/* Theme toggle */}
        <div className='mb-8 flex justify-end'>
          <ThemeToggle />
        </div>

        {/* Main heading with Funnel Display */}
        <Heading
          level='h1'
          weight='bold'
          className='tracking-tight sm:text-5xl lg:text-6xl'
        >
          Welcome to Sojournii
        </Heading>

        {/* Subheading with Funnel Sans */}
        <p className='text-muted-foreground mt-6 font-sans text-xl'>
          Your journey begins here with our beautiful typography system.
        </p>

        {/* Body text with Funnel Sans */}
        <div className='prose prose-lg dark:prose-invert mt-8 max-w-none'>
          <p className='text-foreground font-sans leading-relaxed'>
            This page demonstrates our new font system featuring Funnel Sans for
            body text, Funnel Display for headings, and IBM Plex Mono for code
            and technical content.
          </p>
        </div>

        {/* Code example with IBM Plex Mono */}
        <div className='mt-8'>
          <Heading level='h2' weight='bold' className='mb-4'>
            Code Example
          </Heading>
          <div className='bg-card rounded-lg border p-6'>
            <pre className='overflow-x-auto font-mono text-sm text-green-400'>
              <code>{`// This is IBM Plex Mono
function welcome() {
  console.log("Hello, Sojournii!");
  return "Welcome aboard!";
}`}</code>
            </pre>
          </div>
        </div>

        {/* Navigation to protected area */}
        <div className='mt-12 text-center'>
          <Heading level='h2' weight='bold' className='mb-4'>
            Ready to get started?
          </Heading>
          <p className='text-muted-foreground mb-6 font-sans'>
            Sign in to access your personal dashboard and protected content.
          </p>
          <div className='flex justify-center gap-4'>
            <Link
              href='/sign-in'
              className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md border border-transparent px-6 py-3 text-base font-medium transition-colors'
            >
              Sign In
            </Link>
            <Link
              href='/sign-up'
              className='border-border bg-card text-card-foreground hover:bg-accent inline-flex items-center rounded-md border px-6 py-3 text-base font-medium transition-colors'
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Font showcase */}
        <div className='mt-12 grid grid-cols-1 gap-8 md:grid-cols-3'>
          <div className='bg-card rounded-lg border p-6 shadow-sm'>
            <Heading level='h3' weight='bold' className='mb-2'>
              Funnel Display
            </Heading>
            <p className='font-display text-muted-foreground text-sm'>
              Perfect for headings and titles
            </p>
          </div>

          <div className='bg-card rounded-lg border p-6 shadow-sm'>
            <Heading level='h3' weight='bold' className='mb-2'>
              Funnel Sans
            </Heading>
            <p className='text-muted-foreground font-sans text-sm'>
              Ideal for body text and UI elements
            </p>
          </div>

          <div className='bg-card rounded-lg border p-6 shadow-sm'>
            <Heading level='h3' weight='bold' className='mb-2'>
              IBM Plex Mono
            </Heading>
            <p className='text-muted-foreground font-mono text-sm'>
              Great for code and technical content
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
