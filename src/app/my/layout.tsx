'use client'

import { Header } from '@/components/layout/header'
import ConvexClientProvider from '@/components/providers/convex-provider'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ClerkProvider } from '@clerk/nextjs'

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <div className='bg-background min-h-screen'>
          <Header />
          <div className='flex justify-end p-4'>
            <ThemeToggle />
          </div>
          <main>{children}</main>
        </div>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}
