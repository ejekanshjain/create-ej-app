/**
 * Data-access layer for the `todos` resource.
 *
 * All direct database interactions for todos are encapsulated here.
 * Route handlers call these functions and never import `db` directly,
 * keeping database logic separate from HTTP concerns.
 */
import { asc, count, desc, eq, ilike, InferSelectModel, or } from 'drizzle-orm'
import { db } from '~/db'
import { todosTable } from '~/db/schema'
import { SortOrderEnum } from '~/lib/util'

type TodoType = InferSelectModel<typeof todosTable>

/** Input parameters accepted by {@link getTodos}. */
type GetTodosInput = {
  page: number
  limit: number
  sortBy?: keyof TodoType
  sortOrder?: SortOrderEnum
  search?: string
}

/**
 * Fetches a paginated, optionally sorted and searched list of todos.
 *
 * @returns A readonly tuple `[todos, total]`.
 */
export const getTodos = async ({
  page,
  limit,
  sortBy = 'createdAt',
  sortOrder = SortOrderEnum.DESC,
  search
}: GetTodosInput) => {
  const where = search
    ? or(
        ilike(todosTable.title, `%${search}%`),
        ilike(todosTable.content, `%${search}%`)
      )
    : undefined

  const [results, total] = await Promise.all([
    db.query.todosTable.findMany({
      where,
      limit,
      offset: (page - 1) * limit,
      orderBy: [
        sortOrder === SortOrderEnum.ASC
          ? asc(todosTable[sortBy])
          : desc(todosTable[sortBy])
      ]
    }),
    db
      .select({
        count: count()
      })
      .from(todosTable)
      .where(where)
  ])

  return [results, total[0]?.count || 0] as const
}

/**
 * Fetches a single todo by its UUID.
 * @returns The todo row, or `undefined` if no match was found.
 */
export const getTodoById = async (id: string) => {
  return await db.query.todosTable.findFirst({
    where: eq(todosTable.id, id)
  })
}

/** Input shape for creating a new todo. */
type CreateTodoInput = {
  title: string
  content?: string | null
}

/**
 * Inserts a new todo row and returns the generated UUID.
 * @throws If the INSERT succeeds but no id is returned (should never happen).
 */
export const createTodo = async (input: CreateTodoInput) => {
  const [todo] = await db
    .insert(todosTable)
    .values({
      title: input.title,
      content: input.content
    })
    .returning({
      id: todosTable.id
    })

  if (!todo?.id) {
    throw new Error('Failed to create todo or not returning id')
  }

  return todo.id
}

/** Input shape for partially updating an existing todo. */
type UpdateTodoInput = {
  id: string
  title?: string
  content?: string | null
}

/**
 * Updates an existing todo by UUID.
 * Only the fields present in `input` (besides `id`) are written.
 * @returns `true` if a row was updated, `false` if the id was not found.
 */
export const updateTodoById = async (input: UpdateTodoInput) => {
  const { id, ...rest } = input

  const [todo] = await db
    .update(todosTable)
    .set(rest)
    .where(eq(todosTable.id, id))
    .returning({
      id: todosTable.id
    })

  return !!todo?.id
}

/**
 * Deletes a todo by UUID.
 * @returns `true` if a row was deleted, `false` if the id was not found.
 */
export const deleteTodoById = async (id: string) => {
  const [todo] = await db
    .delete(todosTable)
    .where(eq(todosTable.id, id))
    .returning({
      id: todosTable.id
    })

  return !!todo?.id
}
