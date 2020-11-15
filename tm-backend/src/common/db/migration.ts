import Umzug from 'umzug'
import path from 'path'
import { getDatabase } from './database'

let umzug: Umzug.Umzug
export function getUmzug() {
	if (umzug) return umzug

	umzug = new Umzug({
		storage: 'sequelize',
		storageOptions: {
			sequelize: getDatabase()
		},
		migrations: {
			path: path.join(__dirname, 'migrations'),
			pattern: /^\d+[\w-]+\.js$/,
			params: [getDatabase().getQueryInterface()]
		}
	})

	umzug.on('migrating', name => {
		console.log(`  - Running migration ${name}...`)
	})

	umzug.on('reverting', name => {
		console.log(`  - Reverting migration ${name}...`)
	})

	return umzug
}
