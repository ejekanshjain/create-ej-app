import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { getOrganizationsCached } from '../../actions/organizations'
import { CreateOrganizationForm } from './_components/create-organization-form'

export default async function OnboardingPage() {
  const organizations = (await getOrganizationsCached())?.data ?? []
  const isFirstOrg = organizations.length === 0

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-2 py-8">
      <div className="flex flex-col gap-2">
        {isFirstOrg ? null : (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-2 w-fit"
          >
            <Link href="/app">
              <ArrowLeft />
              Back to Organizations
            </Link>
          </Button>
        )}
        <h1 className="text-3xl font-bold tracking-tight">
          {isFirstOrg ? 'Create Your Organization' : 'Create an Organization'}
        </h1>
        <p className="text-muted-foreground">
          {isFirstOrg
            ? 'Set up an organization to get started. You can invite teammates next.'
            : 'Each organization has its own members, settings, and billing.'}
        </p>
      </div>

      <CreateOrganizationForm />
    </div>
  )
}
