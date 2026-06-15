import z from 'zod'

export const phoneValidation = z
  .string()
  .trim()
  .min(10)
  .max(20)
  .regex(/^[\d+\-().\s]+$/)

export const emailValidation = z.email().trim().toLowerCase()

export const stringValidation = z.string().trim().min(1).max(255)
