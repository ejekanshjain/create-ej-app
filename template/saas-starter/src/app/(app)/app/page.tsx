import { Building2, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { getUserOrganizationsCached } from '~/lib/organization-access'
import { siteConfig } from '~/lib/siteConfig'

export default async function Page() {
  const organizations = await getUserOrganizationsCached()

  if (organizations.length === 0) {
    return redirect('/app/onboarding')
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-2 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to {siteConfig.name}
        </h1>
        <p className="text-muted-foreground">
          Select an organization to manage, or create a new one.
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
                {org.logo ? (
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={org.logo}
                      alt={org.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={org.logo.startsWith('data:')}
                    />
                  </div>
                ) : (
                  <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <Building2 className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">{org.name}</CardTitle>
                  <CardDescription className="truncate text-xs capitalize">
                    {org.role}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}

        <Link href="/app/onboarding" className="group">
          <Card className="hover:border-primary hover:bg-muted/50 flex h-full min-h-28 cursor-pointer flex-col items-center justify-center border-dashed transition-all">
            <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-full">
              <Plus className="size-5" />
            </div>
            <div className="text-muted-foreground font-semibold">
              Create organization
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
