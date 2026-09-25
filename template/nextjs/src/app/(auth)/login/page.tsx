/**
 * @fileoverview Login/Sign-in Page
 *
 * Authentication entry point supporting multiple sign-in methods:
 * - Email with magic link (passwordless)
 * - OAuth (Google, GitHub)
 *
 * **Behavior:**
 * - Redirects to /admin for admin users
 * - Redirects to /app for regular authenticated users
 * - Shows login form for anonymous users
 *
 * @module app/(auth)/login/page
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '~/components/logo'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { getAuthSession } from '~/lib/auth'
import { sanitizeCallbackUrl } from '~/lib/callback-url'
import { EmailLoginForm } from './email-login-form'
import { SocialLoginButtons } from './social-login-buttons'

/**
 * Login Page Component
 *
 * Renders authentication page with multiple login options.
 * Checks session and redirects already-authenticated users.
 *
 * @returns {JSX.Element} Login form with email and OAuth options
 */
export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const authSession = await getAuthSession()
  const resolvedParams = (await searchParams) ?? {}
  const callbackUrl = sanitizeCallbackUrl(resolvedParams.callbackUrl)

  if (authSession?.isAdmin) {
    return redirect(callbackUrl ?? '/admin')
  } else if (authSession) {
    return redirect(callbackUrl ?? '/app')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto mb-4 inline-flex">
            <Logo size={40} priority className="text-xl" />
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-muted-foreground/50 bg-muted/50 rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground text-sm">
              <strong>New to our site?</strong> No need to create a separate
              account. Use either option below to sign up and log in.
            </p>
          </div>

          <EmailLoginForm callbackUrl={callbackUrl} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Or continue with
              </span>
            </div>
          </div>

          <SocialLoginButtons callbackUrl={callbackUrl} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Separator className="my-2" />
          <div className="text-muted-foreground text-center text-sm">
            <Link
              href="/"
              className="text-primary underline-offset-4 hover:underline"
            >
              Return to Home Page
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
