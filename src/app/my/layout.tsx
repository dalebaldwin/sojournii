'use client'

import { Header } from '@/components/layout/header'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className='bg-background min-h-screen'>
        <Header />
        <div className='flex justify-end p-4'>
          <ThemeToggle />
        </div>
        <main>{children}</main>
      </div>
    </QueryProvider>
  )
}
