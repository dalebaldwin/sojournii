'use client'

import { OnboardingGuard } from '@/components/auth/OnboardingGuard'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import { DotPattern } from '@/components/ui/dot-pattern'
import { PageHeader } from '@/components/ui/page-header'
import { useAccountSettings } from '@/hooks/useAccountSettings'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const accountSettings = useAccountSettings()

  return (
    <OnboardingGuard>
      {!accountSettings ? (
        <div className='text-muted-foreground flex h-screen items-center justify-center text-lg'>
          Loading...
        </div>
      ) : (
        <div className='container mx-auto p-6'>
          <PageHeader
            title='Dashboard'
            description='Welcome to your career hub'
            className='mb-8'
          />

          <BentoGrid className='grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Retro - Large card */}
            <BentoCard
              name='Retro'
              description='Reflect on your progress and learnings'
              className='min-h-[300px] md:col-span-2'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-blue-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={20}
                    height={20}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                <p className='text-muted-foreground text-sm'>
                  Review your recent achievements and areas for improvement.
                </p>
                <div className='space-y-2'>
                  <div className='text-muted-foreground text-xs'>
                    Recent insights:
                  </div>
                  <ul className='space-y-1 text-sm'>
                    <li>• Communication improved in team meetings</li>
                    <li>• Task prioritization needs work</li>
                    <li>• Learning velocity increased this quarter</li>
                  </ul>
                </div>
              </div>
            </BentoCard>

            {/* Work Hours - Medium card */}
            <BentoCard
              name='Work Hours'
              description='Track your time and productivity'
              className='min-h-[200px]'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-green-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={15}
                    height={15}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-2xl font-bold'>32h</span>
                  <span className='text-muted-foreground text-xs'>
                    This week
                  </span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Target: 40h</span>
                    <span>80%</span>
                  </div>
                  <div className='bg-muted h-2 w-full rounded-full'>
                    <div className='h-2 w-4/5 rounded-full bg-green-500'></div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Tasks - Large card */}
            <BentoCard
              name='Tasks'
              description='Manage your current workload'
              className='min-h-[300px] md:col-span-2'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-purple-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={18}
                    height={18}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Today&apos;s Focus
                  </span>
                  <span className='rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300'>
                    3 pending
                  </span>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                    <span className='text-sm'>Review quarterly reports</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                    <span className='text-sm'>Prepare client presentation</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='h-2 w-2 rounded-full bg-green-500'></div>
                    <span className='text-sm'>Team standup at 2 PM</span>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Goals - Medium card */}
            <BentoCard
              name='Goals'
              description='Track your objectives and milestones'
              className='min-h-[250px]'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-orange-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={16}
                    height={16}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                <div className='space-y-3'>
                  <div>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Q1 Revenue Target
                      </span>
                      <span className='text-muted-foreground text-xs'>85%</span>
                    </div>
                    <div className='bg-muted h-2 w-full rounded-full'>
                      <div className='h-2 w-[85%] rounded-full bg-orange-500'></div>
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Skill Development
                      </span>
                      <span className='text-muted-foreground text-xs'>60%</span>
                    </div>
                    <div className='bg-muted h-2 w-full rounded-full'>
                      <div className='h-2 w-[60%] rounded-full bg-orange-500'></div>
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 flex items-center justify-between'>
                      <span className='text-sm font-medium'>Team Growth</span>
                      <span className='text-muted-foreground text-xs'>40%</span>
                    </div>
                    <div className='bg-muted h-2 w-full rounded-full'>
                      <div className='h-2 w-[40%] rounded-full bg-orange-500'></div>
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Notes - Large card */}
            <BentoCard
              name='Notes'
              description='Quick thoughts and important reminders'
              className='min-h-[300px] md:col-span-2'
              background={
                <div className='absolute inset-0'>
                  <DotPattern
                    className={cn(
                      'text-cyan-500/30',
                      '[mask-image:linear-gradient(to_bottom_right,white,transparent)]'
                    )}
                    width={14}
                    height={14}
                  />
                  <div className='absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent' />
                </div>
              }
            >
              <div className='space-y-4'>
                <div className='space-y-3'>
                  <div className='bg-muted/50 rounded-lg border-l-4 border-cyan-500 p-3'>
                    <div className='text-muted-foreground mb-1 text-xs'>
                      Mar 15, 2024
                    </div>
                    <p className='text-sm'>
                      Great feedback from client meeting - they loved the new
                      dashboard design. Consider implementing the suggested
                      analytics features.
                    </p>
                  </div>
                  <div className='bg-muted/50 rounded-lg border-l-4 border-blue-500 p-3'>
                    <div className='text-muted-foreground mb-1 text-xs'>
                      Mar 14, 2024
                    </div>
                    <p className='text-sm'>
                      Team velocity has improved 20% since implementing new
                      sprint planning process. Document the approach for other
                      teams.
                    </p>
                  </div>
                  <div className='bg-muted/50 rounded-lg border-l-4 border-green-500 p-3'>
                    <div className='text-muted-foreground mb-1 text-xs'>
                      Mar 13, 2024
                    </div>
                    <p className='text-sm'>
                      Remember: Schedule 1:1s with each team member this month.
                      Focus on career development goals.
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      )}
    </OnboardingGuard>
  )
}
