/**
 * Todos resource router.
 *
 * Defines the full CRUD REST API for the `todos` resource mounted at
 * `/api/todos`.  Every handler delegates database work to the data-access
 * layer (`~/data-access/todo`) and uses Zod schemas for request
 * validation so that invalid input is rejected before it reaches the DB.
 *
 * Endpoints:
 *   GET    /api/todos          – List todos with pagination, sorting & search
 *   GET    /api/todos/:id      – Fetch a single todo by UUID
 *   POST   /api/todos          – Create a new todo
 *   PATCH  /api/todos/:id      – Partially update an existing todo
 *   DELETE /api/todos/:id      – Delete a todo
 */
import Elysia, { status } from 'elysia'
import { z } from 'zod'
import {
  createTodo,
  deleteTodoById,
  getTodoById,
  getTodos,
  updateTodoById
} from '~/data-access/todo'
import { getSortSchema, paginationSchema } from '~/lib/util'

export const todoRouter = new Elysia({ prefix: '/todos' })

/**
 * GET /api/todos
 * Returns a paginated, optionally sorted and searched list of todos.
 * Supports full-text search across `title` and `content` columns.
 */
todoRouter.get(
  '/',
  async ({ query }) => {
    try {
      const [todos, count] = await getTodos(query)

      return {
        success: true,
        data: {
          page: query.page,
          limit: query.limit,
          hasMore: query.page * query.limit < count,
          todos,
          count
        }
      }
    } catch (err) {
      console.error('Error in GET /api/todos', err)
      return status(500, {
        success: false,
        error: 'Something went wrong.'
      })
    }
  },
  {
    query: z.object({
      ...paginationSchema,
      ...getSortSchema(['title', 'createdAt', 'updatedAt']),
      search: z.string().trim().min(1).max(100).optional()
    }),
    detail: {
      description: 'Get all todos',
      tags: ['Todos']
    }
  }
)

/**
 * GET /api/todos/:id
 * Fetches a single todo by its UUID. Returns 404 if not found.
 */
todoRouter.get(
  '/:id',
  async ({ params }) => {
    try {
      const todo = await getTodoById(params.id)

      if (!todo) {
        return status(404, {
          success: false,
          error: 'Todo not found'
        })
      }

      return {
        success: true,
        data: {
          todo
        }
      }
    } catch (err) {
      console.error('Error in GET /api/todos/:id', err)
      return status(500, {
        success: false,
        error: 'Something went wrong.'
      })
    }
  },
  {
    // Validate that :id is a well-formed UUID before hitting the DB
    params: z.object({
      id: z.uuid()
    }),
    detail: {
      description: 'Get a todo by id',
      tags: ['Todos']
    }
  }
)

/**
 * POST /api/todos
 * Creates a new todo from the request body. Returns the generated UUID.
 */
todoRouter.post(
  '/',
  async ({ body }) => {
    try {
      const id = await createTodo(body)

      return {
        success: true,
        data: {
          id
        }
      }
    } catch (err) {
      console.error('Error in POST /api/todos', err)
      return status(500, {
        success: false,
        error: 'Something went wrong.'
      })
    }
  },
  {
    body: z.object({
      title: z.string().trim().min(1).max(255),
      content: z.string().trim().max(5000).nullish()
    }),
    detail: {
      description: 'Create a new todo',
      tags: ['Todos']
    }
  }
)

/**
 * PATCH /api/todos/:id
 * Partially updates a todo. All body fields are optional — only provided
 * fields are written to the database. Returns 404 if the todo does not exist.
 */
todoRouter.patch(
  '/:id',
  async ({ params, body }) => {
    try {
      const success = await updateTodoById({
        id: params.id,
        ...body
      })

      if (!success) {
        return status(404, {
          success: false,
          error: 'Todo not found'
        })
      }

      return {
        success: true,
        data: {
          id: params.id
        }
      }
    } catch (err) {
      console.error('Error in PATCH /api/todos/:id', err)
      return status(500, {
        success: false,
        error: 'Something went wrong.'
      })
    }
  },
  {
    params: z.object({
      id: z.uuid()
    }),
    // Both fields are optional for a true partial-update (PATCH) semantic
    body: z.object({
      title: z.string().trim().min(1).max(255).optional(),
      content: z.string().trim().max(5000).nullish()
    }),
    detail: {
      description: 'Update a todo by id',
      tags: ['Todos']
    }
  }
)

/**
 * DELETE /api/todos/:id
 * Permanently removes a todo by UUID. Returns 404 if not found.
 */
todoRouter.delete(
  '/:id',
  async ({ params }) => {
    try {
      const success = await deleteTodoById(params.id)

      if (!success) {
        return status(404, {
          success: false,
          error: 'Todo not found'
        })
      }

      return {
        success: true,
        data: {
          id: params.id
        }
      }
    } catch (err) {
      console.error('Error in DELETE /api/todos/:id', err)
      return status(500, {
        success: false,
        error: 'Something went wrong.'
      })
    }
  },
  {
    params: z.object({
      id: z.uuid()
    }),
    detail: {
      description: 'Delete a todo by id',
      tags: ['Todos']
    }
  }
)
