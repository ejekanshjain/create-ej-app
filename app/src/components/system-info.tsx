'use client'

import { FC, ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type SystemInfoProps = {
  items: {
    label: string
    value: string | ReactNode
  }[]
}

export const SystemInfo: FC<SystemInfoProps> = ({ items }) => {
  return (
    <Card className="max-w-[600px]">
      <CardHeader>
        <CardTitle>System Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4">
          {items.map((item, i) => (
            <div key={i}>
              <dt className="font-semibold">{item.label}</dt>
              <dd>{item.value}</dd>
              {i < items.length - 1 ? (
                <Separator className="mt-2" />
              ) : undefined}
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
