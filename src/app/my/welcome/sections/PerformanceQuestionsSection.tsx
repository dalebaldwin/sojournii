import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import type { PerformanceQuestion } from '@/lib/welcome-data'

interface PerformanceQuestionsSectionProps {
  questions: PerformanceQuestion[]
  nextStep: () => void
  prevStep: () => void
}

export function PerformanceQuestionsSection({
  questions,
  nextStep,
  prevStep,
}: PerformanceQuestionsSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Performance Questions
        </Heading>
        <p className='text-muted-foreground'>
          We will add our default performance questions to the app. We know you
          probably don&apos;t have your company&apos;s questions on hand at a
          moment&apos;s notice. You can continue to use these or update them in
          your settings when you are ready.
        </p>
      </div>
      <div className='space-y-6'>
        {questions.map((q, i) => (
          <div key={i} className='pb-6'>
            <h3 className='text-lg font-semibold'>{q.title}</h3>
            <p className='text-muted-foreground mt-2'>{q.description}</p>
            {i < questions.length - 1 && <hr className='border-border my-6' />}
          </div>
        ))}
        <div className='flex justify-between'>
          <Button variant='ghost' onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>Next</Button>
        </div>
      </div>
    </div>
  )
}
