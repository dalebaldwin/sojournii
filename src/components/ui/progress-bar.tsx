'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressBar({
  currentStep,
  totalSteps,
  className,
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  // Calculate progress percentage
  const progressPercentage = Math.min((currentStep / totalSteps) * 100, 100)

  // Animate progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progressPercentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [progressPercentage])

  return (
    <div className={cn('fixed top-0 right-0 left-0 z-50', className)}>
      <div className='bg-muted/50 h-[10px] w-full'>
        <div
          className='bg-primary h-full transition-all duration-500 ease-out'
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  )
}
