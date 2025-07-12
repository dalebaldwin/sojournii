import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className='bg-background relative min-h-screen'>
      {/* Header */}
      <header className='relative z-10 flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex items-center'>
          <Link href='/'>
            <Heading level='h3' weight='normal' showLines>
              Sojournii
            </Heading>
          </Link>
        </div>
        <div className='flex items-center gap-4'>
          <Link
            href='/pricing'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            Pricing
          </Link>
          <ThemeToggle />
          <Link href='/sign-in'>
            <Button variant='outline' size='sm'>
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className='relative z-10 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center'>
            <Heading level='h1' weight='bold' className='text-4xl sm:text-5xl'>
              Terms of Service
            </Heading>
            <p className='text-muted-foreground mt-6 text-lg'>
              Last updated: December 2024
            </p>
          </div>

          <Separator className='my-12' />

          <div className='prose prose-lg dark:prose-invert max-w-none'>
            <div className='space-y-8'>
              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Agreement to Terms
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  By accessing and using Sojournii (&ldquo;we&rdquo;,
                  &ldquo;our&rdquo;, or &ldquo;us&rdquo;), you accept and agree
                  to be bound by the terms and provision of this agreement. If
                  you do not agree to abide by the above, please do not use this
                  service.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Description of Service
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  Sojournii is a professional development platform that provides
                  tools for tracking work hours, managing tasks, monitoring
                  performance, conducting retrospectives, setting goals, and
                  taking notes. We reserve the right to modify, suspend, or
                  discontinue the service at any time.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  User Accounts
                </Heading>
                <div className='space-y-4'>
                  <p className='text-muted-foreground leading-relaxed'>
                    To use certain features of our service, you must create an
                    account. You are responsible for:
                  </p>
                  <ul className='text-muted-foreground mt-2 list-disc space-y-1 pl-6'>
                    <li>
                      Maintaining the confidentiality of your account
                      credentials
                    </li>
                    <li>All activities that occur under your account</li>
                    <li>Providing accurate and up-to-date information</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </div>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Acceptable Use
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  You agree not to use the service to:
                </p>
                <ul className='text-muted-foreground mt-2 list-disc space-y-1 pl-6'>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the service</li>
                  <li>
                    Use the service for any commercial purpose without
                    permission
                  </li>
                </ul>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Intellectual Property
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  The service and its original content, features, and
                  functionality are and will remain the exclusive property of
                  Sojournii and its licensors. The service is protected by
                  copyright, trademark, and other laws. You may not reproduce,
                  distribute, modify, or create derivative works based on our
                  content.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  User Content
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  You retain ownership of any content you submit to the service.
                  However, by submitting content, you grant us a non-exclusive,
                  worldwide, royalty-free license to use, modify, and display
                  your content for the purpose of providing the service. You are
                  solely responsible for your content and its legality.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Privacy
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, and protect your information when you use
                  our service. By using our service, you agree to the collection
                  and use of information in accordance with our Privacy Policy.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Termination
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We may terminate or suspend your account and bar access to the
                  service immediately, without prior notice or liability, under
                  our sole discretion, for any reason whatsoever including,
                  without limitation, a breach of the terms. You may also
                  terminate your account at any time by contacting us.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Disclaimers
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  The service is provided on an &ldquo;as is&rdquo; and
                  &ldquo;as available&rdquo; basis. We make no warranties,
                  expressed or implied, and hereby disclaim and negate all other
                  warranties including, without limitation, implied warranties
                  or conditions of merchantability, fitness for a particular
                  purpose, or non-infringement of intellectual property or other
                  violation of rights.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Limitation of Liability
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  In no case shall Sojournii, its directors, employees,
                  partners, agents, suppliers, or affiliates be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses, resulting from your
                  use of the service.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Governing Law
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  These terms shall be governed by and construed in accordance
                  with the laws of the jurisdiction in which Sojournii operates,
                  without regard to its conflict of law provisions. Any disputes
                  arising under these terms shall be resolved through binding
                  arbitration.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Changes to Terms
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We reserve the right to modify or replace these terms at any
                  time. If a revision is material, we will provide at least 30
                  days notice prior to any new terms taking effect. What
                  constitutes a material change will be determined at our sole
                  discretion.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Contact Information
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  If you have any questions about these Terms of Service, please
                  contact us at legal@sojournii.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-muted/30 relative z-10 mt-20 px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex items-center'>
              <Link href='/'>
                <Heading level='h6' weight='normal' className='text-lg'>
                  Sojournii
                </Heading>
              </Link>
            </div>
            <div className='flex items-center gap-6'>
              <Link
                href='/pricing'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Pricing
              </Link>
              <Link
                href='/privacy'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <div className='mt-8 border-t pt-8 text-center'>
            <p className='text-muted-foreground text-sm'>
              © 2024 Sojournii. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
