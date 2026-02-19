/**
 * Application entry point.
 *
 * Bootstraps the Elysia HTTP server, registers all route plugins,
 * mounts the OpenAPI documentation UI, and starts
 * listening on the port defined in the environment.
 */
import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import { env } from './env'
import { apiRoutes } from './routes'

async function main() {
  const app = new Elysia()

  // Simple liveness probe used by load-balancers and container orchestrators
  app.get('/health', () => 'OK', {
    detail: {
      description: 'Health check endpoint'
    }
  })

  // Mount all /api/* routes (todo CRUD, etc.)
  app.use(apiRoutes)

  // Serve interactive OpenAPI docs at GET /docs
  app.use(
    openapi({
      path: '/docs'
    })
  )

  // Start the Bun HTTP server on the configured port
  app.listen(env.PORT)

  console.log(`🚀 Server ready at ${app.server?.hostname}:${app.server?.port}`)
}

main()
