import { cn } from '@/lib/utils'

interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Separator({
  className,
  orientation = 'horizontal',
}: SeparatorProps) {
  return (
    <div
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
    />
  )
}
