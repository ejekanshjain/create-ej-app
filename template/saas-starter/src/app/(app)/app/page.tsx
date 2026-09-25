import { Building2, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle } from '~/components/ui/card'
import { siteConfig } from '~/lib/siteConfig'
import { getOrganizationsCached } from '../actions/organizations'

export default async function AppPage() {
  const organizations = (await getOrganizationsCached())?.data ?? []

  if (organizations.length === 0) {
    return redirect('/app/onboarding')
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to {siteConfig.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Choose an organization to open, or create a new one.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organizations.map(org => (
          <Link
            key={org.id}
            href={`/app/${org.id}/dashboard`}
            className="group"
          >
            <Card className="hover:border-primary h-full cursor-pointer transition-all duration-200 hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                {org.logoUrl ? (
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={org.logoUrl}
                      alt={org.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={org.logoUrl.startsWith('data:')}
                    />
                  </div>
                ) : (
                  <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <Building2 className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">{org.name}</CardTitle>
                  <p className="text-muted-foreground truncate text-xs capitalize">
                    {org.role}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}

        <Link href="/app/onboarding">
          <Card className="hover:border-primary hover:bg-muted/50 flex h-full cursor-pointer flex-col items-center justify-center border-dashed py-8 transition-all">
            <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-full">
              <Plus className="size-5" />
            </div>
            <div className="text-muted-foreground font-semibold">
              Create Organization
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
