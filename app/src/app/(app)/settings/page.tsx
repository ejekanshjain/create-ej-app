import { Metadata } from 'next'

import { Heading } from '@/components/heading'
import { Shell } from '@/components/shell'
import { getAuthSession } from '@/lib/auth'
import { delay } from '@/lib/delay'
import { siteConfig } from '@/lib/siteConfig'
import { Render } from './render'

export const metadata: Metadata = {
  title: 'Settings' + ' | ' + siteConfig.name
}

const SettingsPage = async () => {
  const session = await getAuthSession()

  await delay(10000)

  if (!session?.user) return

  return (
    <Shell>
      <Heading heading="Settings" text="Manage account and profile settings." />
      <div className="grid gap-10">
        <Render name={session.user.name || ''} />
      </div>
    </Shell>
  )
}

export default SettingsPage
