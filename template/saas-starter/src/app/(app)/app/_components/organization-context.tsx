'use client'

import { createContext, useContext } from 'react'

type OrganizationContextType = {
  id: string
  name: string
  role: string
  memberId: string
}

// No default: a component rendered outside the provider is a bug, and the
// hook throws rather than passing off an empty organization as real.
const OrganizationContext = createContext<OrganizationContextType | null>(null)

export const OrganizationContextProvider = ({
  children,
  value
}: {
  children: React.ReactNode
  value: OrganizationContextType
}) => {
  return <OrganizationContext value={value}>{children}</OrganizationContext>
}

/** The organization in the current `/app/[orgId]` route. */
export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext)

  if (!context) {
    throw new Error(
      'useOrganizationContext must be used within an OrganizationContextProvider'
    )
  }

  return context
}
