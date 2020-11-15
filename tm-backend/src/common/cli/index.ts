import 'source-map-support/register'
import { Command } from 'commander'
import { stripIndent } from 'common-tags'
import { ConnectionError } from 'sequelize'

// Load configuration into process.env
require('dotenv').config()

const program = new Command()

// Extract version from package.json
program.version(require('../../../package.json').version)
program.description(
	stripIndent`
        TradeMate Bot. Manages memberships, the Discord bot and the
        administration panel.
    `
)

program
	.command('start')
	.description('Start the app')
	.action(createCommandCallback('start'))

program
	.command('db:migrate')
	.description('Run any pending migrations')
	.action(createCommandCallback('db', 'migrate'))

program
	.command('db:migrate:undo')
	.description('Run any pending migrations')
	.action(createCommandCallback('db', 'migrateUndo'))

program
	.command('db:force-sync')
	.description(
		'Delete and re-create the database from scratch (losing all data)'
	)
	.requiredOption('--yes-im-certain')
	.action(createCommandCallback('db', 'forceSync'))

program
	.command('misc:sync-members')
	.description('Sync members of all guilds into the database')
	.action(createCommandCallback('misc', 'syncMembers'))

program
	.command('misc:sync-levels')
	.description('Sync level roles of all members')
	.action(createCommandCallback('misc', 'syncLevels'))

program.parseAsync().catch(() => {})

// Helper function to run the command present in a file and catch common errors
function createCommandCallback(f: string, method = 'run') {
	return async (...params: any[]) => {
		try {
			await require(`./${f}.js`)[method](...params)
		} catch (e) {
			if (e instanceof ConnectionError) {
				console.error('Database error: ' + e.message)
			} else {
				console.error(e)
			}

			process.exit(1)
		}
	}
}
