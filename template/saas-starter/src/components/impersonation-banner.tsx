'use client'

import { UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'
import { Button } from '~/components/ui/button'
import { admin } from '~/lib/auth-client'

export const ImpersonationBanner: FC = () => {
  const router = useRouter()
  const [isStopping, setIsStopping] = useState(false)

  const handleStopImpersonation = async () => {
    try {
      setIsStopping(true)
      await admin.stopImpersonating()
      router.refresh()
    } catch (error) {
      console.error('Failed to stop impersonation:', error)
      setIsStopping(false)
    }
  }

  return (
    <div className="bg-primary text-primary-foreground w-full border-b text-sm">
      <div className="container flex min-h-10 items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <UserX className="size-4" />
          <span className="font-medium">Impersonating User</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopImpersonation}
            disabled={isStopping}
          >
            {isStopping ? 'Stopping...' : 'Stop Impersonation'}
          </Button>
        </div>
      </div>
    </div>
  )
}
