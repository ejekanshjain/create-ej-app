'use client'

import { createContext, useContext } from 'react'

type OrganizationContextType = {
  id: string
  name: string
  role: string
  memberId: string
  userId: string
}

const OrganizationContext = createContext<OrganizationContextType>({
  id: '',
  name: '',
  role: 'member',
  memberId: '',
  userId: ''
})

export const OrganizationContextProvider = ({
  children,
  value
}: {
  children: React.ReactNode
  value: OrganizationContextType
}) => {
  return <OrganizationContext value={value}>{children}</OrganizationContext>
}

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext)

  if (!context) {
    throw new Error(
      'useOrganizationContext must be used within a OrganizationContextProvider'
    )
  }

  return context
}
