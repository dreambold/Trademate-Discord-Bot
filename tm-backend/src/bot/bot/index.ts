import { Client } from 'discord.js'
import { CommandManager } from './CommandManager'
import globby from 'globby'
import bunyan from 'bunyan'
import path from 'path'
import { Command } from './Command'
import { DbCohortEvent } from '../../common/db/models/cohort-event'

interface CommandClass {
	new (): Command
}

export class Bot {
	client: Client
	commandManager: CommandManager
	ready: boolean
	logger: bunyan

	constructor() {
		this.logger = bunyan.createLogger({
			name: 'bot'
		})
		this.client = new Client({
			partials: ['REACTION', 'MESSAGE', 'CHANNEL']
		})
		this.commandManager = new CommandManager()
		this.ready = false

		this.setClientEventListeners()
	}

	run() {
		return Promise.all([
			this.connectDiscord(),
			this.loadCommands(),
			this.loadComponents()
		])
	}

	private connectDiscord() {
		return new Promise((resolve, reject) => {
			this.client.login(process.env.DISCORD_TOKEN).catch(console.error)

			this.client.on('error', (e: any) => {
				console.error('Error:', e.message)

				if (e.code === 'EHOSTUNREACH' || e.code === 'EAI_AGAIN') {
					// Exit the program to allow it to be rebooted by the
					// supervisor
					setTimeout(() => process.exit(1), 250)
				}
			})

			this.client.once('ready', () => {
				this.logger.info(`[BOT] Logged in as @${this.client.user?.tag}`)

				this.client
					.user!.setPresence({
						activity: {
							name: process.env.DISCORD_GAME,
							type: 'PLAYING'
						}
					})
					.then(resolve)
					.catch(reject)
			})
		})
	}

	async loadCommands() {
		const modules = await globby([
			path.join(__dirname, '..', 'commands', '*').replace(/\\/g, '/'),
			'!*.map'
		])

		for (let mod of modules.filter(mod => !mod.endsWith('.map'))) {
			try {
				const cls: CommandClass = require(mod).default
				this.commandManager.addCommand(new cls())
			} catch (err) {
				this.logger.error({ mod, err }, 'Failed to load command')
				console.error(err)
			}
		}
	}

	async loadComponents() {
		const modules = await globby([
			path
				.join(__dirname, '..', 'components', '*', 'index.js')
				.replace(/\\/g, '/'),
			path
				.join(__dirname, '..', 'components', '*', 'index.ts')
				.replace(/\\/g, '/'),
			path.join(__dirname, '..', 'components', '*.js').replace(/\\/g, '/'),
			path.join(__dirname, '..', 'components', '*.ts').replace(/\\/g, '/'),
			'!*.map'
		])

		for (let mod of modules) {
			try {
				const register: () => Promise<any> = require(mod).init
				await register()
			} catch (err) {
				this.logger.error({ mod, err }, 'Failed to load component')
				console.error(err)
			}
		}
	}

	setClientEventListeners() {
		this.client.on('message', message => {
			this.commandManager.onMessage(message).catch(console.error)

			if (message.guild?.id == this.getGuild().id) {
				DbCohortEvent.safeCreateChannelEvent(
					message.author.id,
					message.channel.id
				).catch(() => {})
			}
		})

		this.client.on('disconnect', () => {
			this.logger.warn('Disconnected from the Discord Gateway, reconnecting.')
		})

		this.client.on('rateLimit', info => {
			this.logger.warn('Discord rate limited:', info)
		})
	}

	getGuild() {
		let guild = this.client.guilds.cache.get(process.env.GUILD_ID)

		if (!guild) throw Error('Get guild but invalid guild')

		return guild
	}

	getPrefix(): string {
		return process.env.DISCORD_PREFIX
	}
}

export const bot = new Bot()
