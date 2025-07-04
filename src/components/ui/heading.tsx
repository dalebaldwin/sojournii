import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'
import { forwardRef } from 'react'

const headingVariants = cva(
  'font-display text-foreground relative inline-block',
  {
    variants: {
      level: {
        none: '',
        h1: 'text-6xl pb-4',
        h2: 'text-4xl pb-3',
        h3: 'text-3xl pb-2.5',
        h4: 'text-2xl pb-2',
        h5: 'text-xl pb-1.5',
        h6: 'text-lg pb-1',
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
  }
)

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div'
  showLines?: boolean
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { className, level, weight, as, showLines = false, children, ...props },
    ref
  ) => {
    const Component = as || (level === 'none' ? 'span' : level) || 'h2'

    const getLineClasses = () => {
      if (!showLines) return ''

      // Base line classes
      const baseClasses =
        'after:absolute after:bottom-0 after:translate-y-full after:bg-black after:dark:bg-white after:content-[""] after:-rotate-45 after:origin-left before:absolute before:bottom-0 before:translate-y-full before:bg-black before:dark:bg-white before:content-[""] before:-rotate-45 before:origin-left'

      // Size-specific positioning and dimensions
      const sizeClasses = {
        h1: 'after:left-full after:h-[3px] after:w-12 after:ml-0.5 before:left-full before:h-[3px] before:w-12 before:ml-0.5 before:translate-x-[-0.75rem]',
        h2: 'after:left-full after:h-[2.5px] after:w-10 after:ml-0.25 before:left-full before:h-[2.5px] before:w-10 before:ml-0.25 before:translate-x-[-0.625rem]',
        h3: 'after:left-full after:h-[2px] after:w-8 after:ml-0.25 before:left-full before:h-[2px] before:w-8 before:ml-0.25 before:translate-x-[-0.5rem]',
        h4: 'after:left-full after:h-[1.5px] after:w-6 after:ml-0.25 before:left-full before:h-[1.5px] before:w-6 before:ml-0.25 before:translate-x-[-0.375rem]',
        h5: 'after:left-full after:h-[1px] after:w-5 after:ml-0.25 before:left-full before:h-[1px] before:w-5 before:ml-0.25 before:translate-x-[-0.25rem]',
        h6: 'after:left-full after:h-[1px] after:w-4 after:ml-0.25 before:left-full before:h-[1px] before:w-4 before:ml-0.25 before:translate-x-[-0.25rem]',
        none: '',
      }

      return `${baseClasses} ${sizeClasses[level || 'h2']}`
    }

    return (
      <Component
        className={cn(
          headingVariants({ level, weight, className }),
          getLineClasses()
        )}
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
