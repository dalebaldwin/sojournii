import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { CheckCircle, Target, TrendingUp } from 'lucide-react'

interface IntroSectionProps {
  nextStep: () => void
}

export function IntroSection({ nextStep }: IntroSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl text-center'>
      <Heading level='h1' weight='normal' className='mb-6' showLines>
        Create Your Goal
      </Heading>

      <p className='text-muted-foreground mb-8 text-xl'>
        Let&apos;s turn your aspirations into achievable reality through
        structured goal setting.
      </p>

      <div className='mb-8 space-y-6'>
        <div className='flex items-start gap-4 text-left'>
          <Target className='text-primary mt-1 h-6 w-6 flex-shrink-0' />
          <div>
            <h3 className='mb-2 font-semibold'>Clear Direction</h3>
            <p className='text-muted-foreground text-sm'>
              Define what you want to achieve with specific, meaningful
              descriptions that inspire action.
            </p>
          </div>
        </div>

        <div className='flex items-start gap-4 text-left'>
          <TrendingUp className='text-primary mt-1 h-6 w-6 flex-shrink-0' />
          <div>
            <h3 className='mb-2 font-semibold'>Milestone Mapping</h3>
            <p className='text-muted-foreground text-sm'>
              Break down your goal into smaller, manageable milestones that
              create momentum and celebrate progress.
            </p>
          </div>
        </div>

        <div className='flex items-start gap-4 text-left'>
          <CheckCircle className='text-primary mt-1 h-6 w-6 flex-shrink-0' />
          <div>
            <h3 className='mb-2 font-semibold'>Progress Tracking</h3>
            <p className='text-muted-foreground text-sm'>
              Stay accountable with timeline tracking and milestone completion
              that keeps you moving forward.
            </p>
          </div>
        </div>
      </div>

      <p className='text-muted-foreground mb-8'>
        This guided process will help you create a well-structured goal with
        clear milestones. It should take about 5-10 minutes to complete.
      </p>

      <Button onClick={nextStep} size='lg' className='h-16 px-8'>
        <Heading level='none' weight='normal' className='text-lg'>
          Get Started
        </Heading>
      </Button>
    </div>
  )
}
