import { notFound } from 'next/navigation'
import { getAuthSession } from '~/lib/auth'

export default async function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const authSession = await getAuthSession()

  if (!authSession?.isAdmin) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  )
}
