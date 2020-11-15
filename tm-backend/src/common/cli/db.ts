import * as database from '../db/database'
import { getUmzug } from '../db/migration'

export async function migrate() {
	await database.load()
	console.log('Running all pending migrations...')
	await getUmzug().up()
	process.exit(0)
}

export async function migrateUndo() {
	await database.load()
	console.log('Undoing one migration...')
	await getUmzug().down()
	process.exit(0)
}

export async function forceSync() {
	await database.load()
	console.log('Re-creating database...')
	await database.forceSync()
	process.exit(0)
}
