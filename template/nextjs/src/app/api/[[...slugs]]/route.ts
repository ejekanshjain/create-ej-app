import { Elysia } from 'elysia'
import z from 'zod'

export const elysiaApi = new Elysia({ prefix: '/api' })
  .get('/', 'Hello from Elysia')
  .post(
    '/',
    ({ body }) => {
      return `Hello, ${body.name}!`
    },
    {
      body: z.object({
        name: z.string().trim().min(1).describe('Name of the user')
      }),
      detail: {
        description: 'Greet a user by name'
      }
    }
  )

export const GET = elysiaApi.fetch
export const POST = elysiaApi.fetch
export const PUT = elysiaApi.fetch
export const PATCH = elysiaApi.fetch
export const DELETE = elysiaApi.fetch
