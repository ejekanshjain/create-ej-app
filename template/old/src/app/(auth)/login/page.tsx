import Link from 'next/link'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Render } from './render'

const LoginPage = () => {
  return (
    <div className="container flex h-[90vh] w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4">
        <Button variant="ghost">
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-80">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <Render />
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export default LoginPage
