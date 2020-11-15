import { Message, TextChannel, DMChannel } from 'discord.js'

export interface CommandContext {
	message: Message
	commandName: string
	args: string[]
}

type usageInType = 'dm' | 'guild'

export abstract class Command {
	name: string
	aliases: string[]
	usage: string
	usageIn: usageInType[]
	description: string

	constructor() {
		this.name = ''
		this.aliases = []
		this.usage = ''
		this.usageIn = ['guild']
		this.description = ''
	}

	abstract execute(context: CommandContext)

	sendUsage(channel: TextChannel | DMChannel) {
		return channel.send(this.usage)
	}
}
