'use client'

import { toast } from 'sonner'

export const toastSuccessMessage = (message: string) =>
  toast.success(message, {
    richColors: true,
    position: 'top-center'
  })

export const toastErrorMessage = () =>
  toast.error('Something went wrong. Please try again later.', {
    richColors: true,
    position: 'top-center'
  })
