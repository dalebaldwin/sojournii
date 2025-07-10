'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { QueryProvider } from '@/components/providers/query-provider'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOnSojournPage = pathname?.startsWith('/my/sojourn')

  return (
    <QueryProvider>
      <div className='bg-background min-h-screen'>
        {/* Only show sidebar when not on sojourn pages */}
        {!isOnSojournPage && <Sidebar />}

        <main
          className={`relative ${isOnSojournPage ? '' : 'pt-16 lg:ml-[275px] lg:pt-0'}`}
        >
          {/* Sojourn Button - Only show when not on sojourn pages */}
          {!isOnSojournPage && (
            <div className='fixed top-4 right-4 z-50 lg:top-6 lg:right-6'>
              <Link href='/my/sojourn'>
                <Button
                  size='lg'
                  className='bg-blue-600 shadow-lg hover:bg-blue-700'
                >
                  Sojourn
                </Button>
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </QueryProvider>
  )
}
