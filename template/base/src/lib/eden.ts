import { treaty } from '@elysiajs/eden'
import { elysiaApi } from '~/app/api/[[...slugs]]/route'

export const api =
  typeof process !== 'undefined'
    ? treaty(elysiaApi).api
    : treaty<typeof elysiaApi>(window.location.host).api
