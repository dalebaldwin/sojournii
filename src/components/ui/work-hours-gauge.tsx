'use client'

import { cn } from '@/lib/utils'

interface WorkHoursGaugeProps {
  currentHours: number
  targetHours: number
  className?: string
}

export function WorkHoursGauge({
  currentHours,
  targetHours,
  className,
}: WorkHoursGaugeProps) {
  const percentage = Math.min((currentHours / targetHours) * 100, 100)
  const isOnTrack = percentage >= 80 // Consider on track if >= 80%
  const isOverTarget = percentage > 100

  // Calculate the stroke offset for the circular progress
  const circumference = 2 * Math.PI * 45 // radius of 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (isOverTarget) return 'text-blue-500'
    if (isOnTrack) return 'text-green-500'
    return 'text-orange-500'
  }

  const getStatus = () => {
    if (isOverTarget) return 'Over Target'
    if (isOnTrack) return 'On Track'
    return 'Under Target'
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className='relative'>
        <svg width='100' height='100' className='-rotate-90 transform'>
          {/* Background circle */}
          <circle
            cx='50'
            cy='50'
            r='45'
            stroke='currentColor'
            strokeWidth='8'
            fill='none'
            className='text-muted/20'
          />
          {/* Progress circle */}
          <circle
            cx='50'
            cy='50'
            r='45'
            stroke='currentColor'
            strokeWidth='8'
            fill='none'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
            className={cn('transition-all duration-500', getColor())}
          />
        </svg>
        {/* Percentage text */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-lg font-bold'>{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <div className='text-sm font-medium'>
          {currentHours}h / {targetHours}h
        </div>
        <div className={cn('text-xs font-medium', getColor())}>
          {getStatus()}
        </div>
      </div>
    </div>
  )
}
