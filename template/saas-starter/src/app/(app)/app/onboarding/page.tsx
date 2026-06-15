import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { getUserOrganizationsCached } from '~/lib/organization-access'
import { CreateOrganizationForm } from './_components/create-organization-form'

export default async function Page() {
  const organizations = await getUserOrganizationsCached()
  const isFirstOrg = organizations.length === 0

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-2 py-8">
      <div className="flex flex-col gap-2">
        {!isFirstOrg ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground -ml-2 w-fit"
          >
            <Link href="/app">
              <ArrowLeft className="mr-2 size-4" />
              Back to organizations
            </Link>
          </Button>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight">
          {isFirstOrg
            ? 'Create your organization'
            : 'Create a new organization'}
        </h1>
        <p className="text-muted-foreground">
          {isFirstOrg
            ? 'Set up an organization to get started. You can invite teammates afterwards.'
            : 'Spin up another workspace. You can switch between organizations at any time.'}
        </p>
      </div>

      <CreateOrganizationForm />
    </div>
  )
}
