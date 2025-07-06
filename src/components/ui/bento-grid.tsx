'use client'

import { cn } from '@/lib/utils'
import React from 'react'

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  background?: React.ReactNode
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  name?: string
  description?: string
}

export function BentoCard({
  children,
  className,
  background,
  Icon,
  name,
  description,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'group bg-background relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md',
        className
      )}
      {...props}
    >
      {background && <div className='absolute inset-0'>{background}</div>}
      <div className='relative z-10 flex h-full flex-col justify-between'>
        <div>
          {Icon && (
            <div className='bg-muted mb-2 flex size-12 items-center justify-center rounded-lg'>
              <Icon className='text-muted-foreground size-6' />
            </div>
          )}
          {name && (
            <h3 className='text-foreground mb-2 text-lg font-semibold'>
              {name}
            </h3>
          )}
          {description && (
            <p className='text-muted-foreground'>{description}</p>
          )}
        </div>
        <div className='mt-4'>{children}</div>
      </div>
    </div>
  )
}

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
