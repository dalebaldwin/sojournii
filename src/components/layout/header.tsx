'use client'

import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export function Header() {
  return (
    <header className='flex h-16 items-center justify-end gap-4 p-4'>
      <SignedOut>
        <Button variant='ghost' asChild>
          <Link href='/sign-in'>Sign In</Link>
        </Button>
        <Button asChild>
          <Link href='/sign-up'>Sign Up</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <Button variant='ghost' asChild>
          <Link href='/my'>My Dashboard</Link>
        </Button>
        <UserButton />
      </SignedIn>
    </header>
  )
}
