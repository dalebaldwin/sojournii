'use client'

import { Heading } from '@/components/ui/heading'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Mail,
  Menu,
  Settings,
  User,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  // Add refs for outside click handling
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)

  // Outside click handler for user menu
  useEffect(() => {
    if (!isUserMenuOpen) return
    function handleClick(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isUserMenuOpen])

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  const navItems = [{ href: '/my', label: 'Dashboard' }]

  const userMenuItems = [
    { href: '/my/accounts', label: 'Account', icon: User },
    { href: '/my/settings', label: 'Settings', icon: Settings },
    { href: '/support', label: 'Support', icon: HelpCircle },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  const SidebarContent = () => (
    <div className='bg-background flex h-full flex-col border-r'>
      {/* Header with Logo and Theme Toggle */}
      <div className='flex items-center justify-between border-b p-4'>
        <Heading level='h2' weight='normal' className='text-lg'>
          Sojournii
        </Heading>
        <ThemeToggle />
      </div>

      {/* Main Navigation */}
      <nav className='flex-1 p-4'>
        <div className='space-y-2'>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Menu */}
      <div className='border-t p-4'>
        <div className='relative'>
          <button
            ref={userMenuButtonRef}
            onClick={toggleUserMenu}
            className='hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
          >
            <div className='flex flex-1 items-center gap-3'>
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={`${user.firstName || 'User'}'s avatar`}
                  className='h-8 w-8 rounded-full object-cover'
                  width={32}
                  height={32}
                />
              ) : (
                <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                  <User className='h-4 w-4' />
                </div>
              )}
              <div className='flex-1 text-left'>
                <div className='font-medium'>
                  {user?.firstName} {user?.lastName}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                ref={userMenuRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='bg-background absolute right-0 bottom-full left-0 mb-2 rounded-lg border p-2 shadow-lg'
              >
                <div className='space-y-1'>
                  {userMenuItems.map(item => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Icon className='h-4 w-4' />
                        {item.label}
                      </Link>
                    )
                  })}

                  <div className='border-t pt-1'>
                    <SignOutButton>
                      <button className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300'>
                        <LogOut className='h-4 w-4' />
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className='bg-background fixed top-4 left-4 z-50 rounded-md border p-2 shadow-sm lg:hidden'
      >
        {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>

      {/* Desktop Sidebar */}
      <div className='fixed top-0 left-0 z-40 hidden h-full w-[275px] lg:block'>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-40 bg-black/50 lg:hidden'
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed top-0 left-0 z-50 h-full w-[275px] lg:hidden'
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
