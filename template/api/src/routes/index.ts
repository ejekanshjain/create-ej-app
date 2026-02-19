/**
 * Top-level API router.
 *
 * All REST resources are registered here under the `/api` prefix and
 * then mounted onto the root Elysia app in `src/index.ts`.
 *
 * Adding a new resource:
 *   1. Create its router in `src/routes/<resource>/index.ts`.
 *   2. Import it here and call `apiRoutes.use(yourRouter)`.
 */
import Elysia from 'elysia'
import { todoRouter } from './todo'

export const apiRoutes = new Elysia({
  prefix: '/api'
})

apiRoutes.use(todoRouter)
