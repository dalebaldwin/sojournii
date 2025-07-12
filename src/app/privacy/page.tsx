import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className='bg-background relative min-h-screen'>
      {/* Header */}
      <header className='relative z-10 flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex items-center'>
          <Link href='/'>
            <Heading level='h6' weight='normal' className='text-xl'>
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
              Privacy Policy
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
                  Introduction
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  Sojournii (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
                  &ldquo;us&rdquo;) is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose,
                  and safeguard your information when you use our professional
                  development platform.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Information We Collect
                </Heading>
                <div className='space-y-4'>
                  <div>
                    <Heading level='h3' weight='bold' className='mb-2 text-xl'>
                      Personal Information
                    </Heading>
                    <p className='text-muted-foreground leading-relaxed'>
                      We collect information you provide directly to us, such as
                      when you create an account, update your profile, or
                      contact us. This may include:
                    </p>
                    <ul className='text-muted-foreground mt-2 list-disc space-y-1 pl-6'>
                      <li>Name and email address</li>
                      <li>Work hours and task information</li>
                      <li>Performance data and goals</li>
                      <li>Notes and reflections</li>
                      <li>Employer information (if provided)</li>
                    </ul>
                  </div>
                  <div>
                    <Heading level='h3' weight='bold' className='mb-2 text-xl'>
                      Usage Information
                    </Heading>
                    <p className='text-muted-foreground leading-relaxed'>
                      We automatically collect certain information about your
                      use of our platform, including log data, device
                      information, and usage patterns to improve our services.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  How We Use Your Information
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We use the information we collect to:
                </p>
                <ul className='text-muted-foreground mt-2 list-disc space-y-1 pl-6'>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Information Sharing
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties except as described in this
                  Privacy Policy. We may share your information:
                </p>
                <ul className='text-muted-foreground mt-2 list-disc space-y-1 pl-6'>
                  <li>With your consent</li>
                  <li>
                    With service providers who assist us in operating our
                    platform
                  </li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and the safety of our users</li>
                </ul>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Data Security
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We implement appropriate technical and organizational security
                  measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction.
                  However, no method of transmission over the internet is 100%
                  secure.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Your Rights
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  You have the right to:
                </p>
                <ul className='text-muted-foreground mt-2 list-disc space-y-1 pl-6'>
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>
                    Object to or restrict certain processing of your information
                  </li>
                </ul>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Data Retention
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We retain your personal information for as long as your
                  account is active or as needed to provide you services. We
                  will retain and use your information as necessary to comply
                  with our legal obligations and resolve disputes.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Changes to This Privacy Policy
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &ldquo;Last updated&rdquo; date.
                </p>
              </section>

              <section>
                <Heading level='h2' weight='bold' className='mb-4 text-2xl'>
                  Contact Us
                </Heading>
                <p className='text-muted-foreground leading-relaxed'>
                  If you have any questions about this Privacy Policy, please
                  contact us at privacy@sojournii.com.
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
