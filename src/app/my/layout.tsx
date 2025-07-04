'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { QueryProvider } from '@/components/providers/query-provider'

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className='bg-background min-h-screen'>
        <Sidebar />
        <main className='pt-16 lg:ml-[275px] lg:pt-0'>{children}</main>
      </div>
    </QueryProvider>
  )
}
