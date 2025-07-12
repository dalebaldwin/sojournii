import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Star } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: 'for 30 days',
      description: 'Try all features free for 30 days',
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Monthly',
      price: '$10',
      period: 'per month',
      description: 'Full access billed monthly',
      buttonText: 'Choose Monthly',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Annual',
      price: '$8',
      period: 'per month',
      originalPrice: '$10',
      yearlyPrice: '$96',
      description: 'Best value - save 20% with annual billing',
      buttonText: 'Choose Annual',
      buttonVariant: 'outline' as const,
      popular: false,
    },
  ]

  return (
    <div className='bg-background relative min-h-screen'>
      {/* Header */}
      <header className='relative z-10 flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex items-center'>
          <Link href='/'>
            <Heading level='h3' weight='normal' showLines>
              Sojournii
            </Heading>
          </Link>
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

      <main className='relative z-10 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          {/* Header Section */}
          <div className='text-center'>
            <Heading level='h1' weight='bold' className='text-4xl sm:text-5xl'>
              Simple, Transparent Pricing
            </Heading>
            <p className='text-muted-foreground mt-6 text-lg sm:text-xl'>
              Start with a free 30-day trial, then choose the plan that works
              best for you. No hidden fees, cancel anytime.
            </p>
          </div>

          <Separator className='my-12' />

          {/* Pricing Cards */}
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-background'
                }`}
              >
                {plan.popular && (
                  <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                    <div className='bg-primary text-primary-foreground flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium'>
                      <Star className='h-4 w-4' />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className='text-center'>
                  <Heading level='h3' weight='bold' className='text-2xl'>
                    {plan.name}
                  </Heading>
                  <div className='mt-4 flex items-baseline justify-center gap-2'>
                    <span className='text-5xl font-bold'>{plan.price}</span>
                    <span className='text-muted-foreground'>{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className='mt-2 flex items-center justify-center gap-2'>
                      <span className='text-muted-foreground text-sm line-through'>
                        {plan.originalPrice}/month
                      </span>
                      <span className='text-primary text-sm font-medium'>
                        Save 20%
                      </span>
                    </div>
                  )}
                  {plan.yearlyPrice && (
                    <div className='mt-1'>
                      <span className='text-muted-foreground text-sm'>
                        ({plan.yearlyPrice}/year)
                      </span>
                    </div>
                  )}
                  <p className='text-muted-foreground mt-4 text-sm'>
                    {plan.description}
                  </p>
                </div>

                <div className='mt-8'>
                  <Button
                    variant={plan.buttonVariant}
                    size='lg'
                    className='w-full'
                    asChild
                  >
                    <Link href='/sign-up'>{plan.buttonText}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className='mt-20 text-center'>
            <Separator className='mb-16' />
            <Heading level='h2' weight='bold' className='text-3xl'>
              Ready to Transform Your
              <br />
              Professional Growth?
            </Heading>
            <p className='text-muted-foreground mt-6 text-lg'>
              Start your free 30-day trial today. No credit card required.
            </p>
            <div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Link href='/sign-up'>
                <Button size='lg' className='w-full sm:w-auto'>
                  Start Free Trial
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
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-muted/30 relative z-10 mt-20 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex items-center'>
              <Link href='/'>
                <Heading level='h6' weight='normal' className='text-lg'>
                  Sojournii
                </Heading>
              </Link>
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
