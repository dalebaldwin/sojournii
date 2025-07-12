import ConvexClientProvider from '@/components/providers/convex-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Funnel_Display, Funnel_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const funnelSans = Funnel_Sans({
  variable: '--font-funnel-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const funnelDisplay = Funnel_Display({
  variable: '--font-funnel-display',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

const ibmMono = IBM_Plex_Mono({
  variable: '--font-ibm-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Sojournii',
  description:
    'Sojournii helps you track work hours, manage tasks, reflect on performance, and achieve your professional goals—all in one elegant platform.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${funnelSans.variable} ${funnelDisplay.variable} ${ibmMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
