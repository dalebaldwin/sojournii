import { ReactNode } from 'react'
import { Heading } from './heading'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  showLines?: boolean
}

export function PageHeader({
  title,
  description,
  children,
  className = '',
  showLines = true,
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className='space-y-2'>
        <Heading level='h1' weight='normal' showLines={showLines}>
          {title}
        </Heading>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}
