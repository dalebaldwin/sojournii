'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-40' align='end'>
        <div className='space-y-2'>
          <button
            onClick={() => setTheme('light')}
            className='hover:bg-accent flex w-full items-center rounded-md px-3 py-2 text-sm'
          >
            <Sun className='mr-2 h-4 w-4' />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className='hover:bg-accent flex w-full items-center rounded-md px-3 py-2 text-sm'
          >
            <Moon className='mr-2 h-4 w-4' />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className='hover:bg-accent flex w-full items-center rounded-md px-3 py-2 text-sm'
          >
            <Monitor className='mr-2 h-4 w-4' />
            <span>System</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
