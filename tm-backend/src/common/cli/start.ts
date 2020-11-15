import * as database from '../db/database'
import { server } from '../../web/server'
import { bot } from '../../bot/bot'
import { getUmzug } from '../db/migration'

export async function run() {
	// Load & update database
	await database.load()

	// Check for pending migrations
	let pending = await getUmzug().pending()
	if (pending.length > 0) console.warn('WARN: There are pending migrations')

	await Promise.all([server.run(), bot.run()])
}
