import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Heading } from '@/components/ui/heading'
import { Label } from '@/components/ui/label'
import { timezones } from '@/lib/timezones'
import { Timezone } from '@/lib/types'
import { WelcomeData } from '@/lib/welcome-data'

interface TimezoneSectionProps {
  welcomeData: WelcomeData
  userTimezone: string
  showTimezoneSelector: boolean
  setShowTimezoneSelector: (show: boolean) => void
  setWelcomeData: (fn: (prev: WelcomeData) => WelcomeData) => void
  nextStep: () => void
  prevStep: () => void
  selectedTimezone: Timezone | undefined
}

export function TimezoneSection({
  welcomeData,
  userTimezone,
  showTimezoneSelector,
  setShowTimezoneSelector,
  setWelcomeData,
  nextStep,
  prevStep,
  selectedTimezone,
}: TimezoneSectionProps) {
  return (
    <div className='mx-auto w-full max-w-2xl'>
      <div className='mb-8 text-center'>
        <Heading level='h2' weight='bold' className='mb-2' showLines>
          Your Timezone
        </Heading>
        <p className='text-muted-foreground'>
          We&apos;ve detected your timezone to help with scheduling and
          notifications.
        </p>
      </div>
      <div className='space-y-6'>
        {!showTimezoneSelector ? (
          <div className='space-y-4'>
            <div className='bg-muted rounded-lg p-6 text-center'>
              <p className='text-muted-foreground mb-2'>
                We detected your timezone as:
              </p>
              <Heading level='h3' weight='bold' className='text-foreground'>
                {selectedTimezone?.city}, {selectedTimezone?.country}
              </Heading>
              <p className='text-muted-foreground text-sm'>
                {selectedTimezone?.label}
              </p>
            </div>
            <div className='text-center'>
              <Button
                variant='outline'
                onClick={() => setShowTimezoneSelector(true)}
                className='mb-4'
              >
                Select a different timezone
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='bg-muted rounded-lg p-4'>
              <p className='text-muted-foreground mb-2 text-sm'>
                {welcomeData.timezone === userTimezone
                  ? 'Currently using detected timezone:'
                  : 'You have selected:'}
              </p>
              <p className='text-foreground font-medium'>
                {selectedTimezone?.city}, {selectedTimezone?.country}
              </p>
              <p className='text-muted-foreground text-sm'>
                {selectedTimezone?.label}
              </p>
            </div>
            <div className='space-y-2'>
              <Label>Search for a different timezone</Label>
              <Command className='rounded-lg border shadow-md'>
                <CommandInput placeholder='Search for your timezone...' />
                <CommandList className='max-h-64'>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    {timezones.map(tz => (
                      <CommandItem
                        key={tz.value}
                        value={`${tz.city} ${tz.country} ${tz.label}`}
                        onSelect={() => {
                          setWelcomeData(prev => ({
                            ...prev,
                            timezone: tz.value,
                          }))
                        }}
                        className='cursor-pointer'
                      >
                        <div className='flex w-full flex-col'>
                          <div className='font-medium'>
                            {tz.city}, {tz.country}
                          </div>
                          <div className='text-muted-foreground text-sm'>
                            {tz.label}
                          </div>
                        </div>
                        {welcomeData.timezone === tz.value && (
                          <div className='text-primary ml-auto'>✓</div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
            <div className='text-center'>
              <Button
                variant='outline'
                onClick={() => setShowTimezoneSelector(false)}
              >
                Use detected timezone
              </Button>
            </div>
          </div>
        )}
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
