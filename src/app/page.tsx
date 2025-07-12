import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  CheckSquare,
  Clock4,
  NotebookPen,
  RotateCcw,
  Target,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Performance',
      description:
        'Monitor your professional growth with detailed performance evaluations and insights.',
    },
    {
      icon: Target,
      title: 'Goals',
      description:
        'Set ambitious goals and track milestones with our guided goal-setting framework.',
    },
    {
      icon: RotateCcw,
      title: 'Retro',
      description:
        'Reflect on your weekly progress with structured retrospectives and learning opportunities.',
    },
    {
      icon: Clock4,
      title: 'Work Hours',
      description:
        'Track and manage your work hours with intuitive logging and comprehensive analytics.',
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      description:
        'Organize and complete your tasks with smart prioritization and progress tracking.',
    },
    {
      icon: NotebookPen,
      title: 'Notes',
      description:
        'Capture thoughts and ideas with our rich text editor and organized note-taking system.',
    },
  ]

  return (
    <div className='bg-background relative min-h-screen'>
      {/* Background Pattern */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className='opacity-30'
      />

      {/* Header */}
      <header className='relative z-10 flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex items-center'>
          <Heading level='h3' weight='normal' showLines>
            Sojournii
          </Heading>
        </div>
        <div className='flex items-center gap-4'>
          <Link
            href='/pricing'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            Pricing
          </Link>
          <ThemeToggle />
          <Link href='/sign-in'>
            <Button variant='outline' size='sm'>
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className='relative z-10'>
        {/* Hero Section */}
        <section className='px-4 py-20 text-center sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl'>
            <Heading
              level='h1'
              weight='bold'
              className='tracking-tight sm:text-5xl lg:text-6xl'
            >
              Your Professional Journey,
              <br />
              <span className='text-primary'>Beautifully Tracked</span>
            </Heading>
            <p className='text-muted-foreground mt-6 text-xl leading-8 sm:text-2xl'>
              Sojournii helps you monitor performance, achieve goals, conduct
              retrospectives, track work hours, manage tasks, and capture
              notes—all in one elegant platform.
            </p>
            <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Link href='/sign-up'>
                <Button size='lg' className='w-full sm:w-auto'>
                  Get Started Free
                </Button>
              </Link>
              <Link href='/sign-in'>
                <Button
                  variant='outline'
                  size='lg'
                  className='w-full sm:w-auto'
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='px-4 py-20 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-7xl'>
            <div className='text-center'>
              <Heading
                level='h2'
                weight='bold'
                className='text-3xl sm:text-4xl'
              >
                Everything You Need to Excel
              </Heading>
              <p className='text-muted-foreground mt-6 text-lg'>
                Six powerful features designed to help you track, reflect, and
                grow in your professional journey.
              </p>
            </div>

            <div className='mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3'>
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className='group text-center'>
                    <div className='bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110'>
                      <Icon className='h-8 w-8' />
                    </div>
                    <Heading level='h3' weight='bold' className='mb-4 text-xl'>
                      {feature.title}
                    </Heading>
                    <p className='text-muted-foreground leading-relaxed'>
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='px-4 py-20 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <Separator className='mb-16' />
            <Heading level='h2' weight='bold' className='text-3xl sm:text-4xl'>
              Ready to Transform Your
              <br />
              Professional Growth?
            </Heading>
            <p className='text-muted-foreground mt-6 text-lg'>
              Join thousands of professionals who use Sojournii to track their
              progress, reflect on their journey, and achieve their career
              goals.
            </p>
            <div className='mt-10'>
              <Link href='/sign-up'>
                <Button size='lg' className='px-8 py-4 text-lg'>
                  Start Your Journey Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='bg-muted/30 relative z-10 mt-20 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex items-center'>
              <Heading level='h6' weight='normal' className='text-lg'>
                Sojournii
              </Heading>
            </div>
            <div className='flex items-center gap-6'>
              <Link
                href='/pricing'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Pricing
              </Link>
              <Link
                href='/privacy'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <div className='mt-8 border-t pt-8 text-center'>
            <p className='text-muted-foreground text-sm'>
              © 2024 Sojournii. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
