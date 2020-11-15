import { Command, CommandContext } from './Command'
import { Message } from 'discord.js'
import { bot } from '.'

export class CommandManager extends Command {
	commands: Command[] = []
	simpleReplyHandlers: Array<
		(message: Message, isCommand: boolean) => void
	> = []

	addCommand(command: Command) {
		this.commands.push(command)
	}

	async onMessage(message: Message) {
		let content = message.content
		const prefix = bot.getPrefix()

		// Some client specific demand
		if (content.toLowerCase() === 'upgrade') {
			content = `${prefix}upgrade`
		}

		if (message.author.bot) return

		// Transform bot mentions into prefixed commands
		if (
			content.startsWith(`<@${bot.client.user?.id}>`) ||
			content.startsWith(`<@!${bot.client.user?.id}>`)
		) {
			content =
				prefix + content.slice(`<@${bot.client.user?.id}>`.length).trim()
		}

		if (content.startsWith(prefix.trim())) {
			const args = content
				.slice(prefix.trim().length)
				.replace(/\s+/g, ' ')
				.trim()
				.split(' ')

			for (let handler of this.simpleReplyHandlers) {
				handler(message, true)
			}

			try {
				await this.execute({
					args,
					commandName: '',
					message
				})
			} catch (e) {
				console.log('Error handling message: ' + message.content, e)
			}
		} else {
			for (let handler of this.simpleReplyHandlers) {
				handler(message, false)
			}
		}
	}

	async execute({ message, args }: CommandContext) {
		const commandName = args.length > 0 ? args[0] : '__default'

		let isDM =
			message.channel.id ===
			(message.author.dmChannel && message.author.dmChannel.id)

		for (let command of this.commands.filter(command =>
			command.usageIn.includes(isDM ? 'dm' : 'guild')
		)) {
			if ([command.name, ...command.aliases].includes(commandName)) {
				await command.execute({
					args: args.slice(1),
					commandName,
					message
				})
				break
			}
		}
	}

	// Wait for a message from a certain user in a certain channel
	// Useful for reply chains
	simpleResponse(
		userId: string,
		channelId: string,
		timeout = 60000
	): Promise<Message> {
		return new Promise((resolve, reject) => {
			let handler = (message: Message, isCommand: boolean) => {
				if (message.author.id === userId && message.channel.id === channelId) {
					clearTimeout(timeoutHold)
					this.simpleReplyHandlers = this.simpleReplyHandlers.filter(
						h => h !== handler
					)
					if (isCommand) reject(Error('A command was made'))
					else resolve(message)
				}
			}

			let timeoutHold = setTimeout(() => {
				this.simpleReplyHandlers = this.simpleReplyHandlers.filter(
					h => h !== handler
				)
				let err = Error('Reply timed out')
				err.name = 'REP_TIMEOUT'
				reject(err)
			}, timeout)

			this.simpleReplyHandlers.push(handler)
		})
	}
}
