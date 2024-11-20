import {
  clearAllTables,
  initializeDatabase,
  insertRandomData,
} from './database'

async function init() {
  await initializeDatabase().catch(error =>
    console.error('Error initializing database:', error)
  )
  await clearAllTables().catch(error =>
    console.error('Failed to clear database tables during database init')
  )

  await insertRandomData().catch(error =>
    console.error('Error initializing database:', error)
  )
}

init()