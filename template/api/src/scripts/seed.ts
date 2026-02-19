import { db } from '~/db'
import { todosTable } from '~/db/schema'

const seedData = async () => {
  await db.insert(todosTable).values([
    {
      title: 'Buy groceries',
      content: 'Milk, Bread, Butter, Jam'
    },
    {
      title: 'Finish project',
      content: 'Complete the frontend and backend integration'
    }
  ])
}

if (import.meta.main) {
  try {
    await seedData()
  } catch (err) {
    console.error('Error seeding data:', err)
  } finally {
    process.exit(0)
  }
}
