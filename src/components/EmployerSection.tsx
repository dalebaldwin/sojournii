'use client'

import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface EmployerSectionProps {
  employer?: string
  onEmployerChange: (employer: string) => void
  className?: string
}

export function EmployerSection({
  employer,
  onEmployerChange,
  className,
}: EmployerSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className='bg-muted rounded-lg p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <Heading level='h2' weight='bold' showLines>
            Employer
          </Heading>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='employer'>Current Employer</Label>
          <Input
            id='employer'
            type='text'
            placeholder='Enter your employer name'
            value={employer || ''}
            onChange={e => onEmployerChange(e.target.value)}
            className='w-full'
          />
        </div>

        <p className='text-muted-foreground mt-4 text-xs'>
          Tell us about your current employer to help personalize your
          experience.
        </p>
      </div>
    </div>
  )
}
