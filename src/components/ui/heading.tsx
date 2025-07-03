import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'
import { forwardRef } from 'react'

const headingVariants = cva('font-display text-foreground', {
  variants: {
    level: {
      none: '',
      h1: 'text-6xl',
      h2: 'text-4xl',
      h3: 'text-3xl',
      h4: 'text-2xl',
      h5: 'text-xl',
      h6: 'text-lg',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      bold: 'font-bold',
    },
  },
  defaultVariants: {
    level: 'h2',
    weight: 'normal',
  },
})

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div'
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, weight, as, children, ...props }, ref) => {
    const Component = as || (level === 'none' ? 'span' : level) || 'h2'

    return (
      <Component
        className={cn(headingVariants({ level, weight, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Heading.displayName = 'Heading'

export { Heading, headingVariants }
