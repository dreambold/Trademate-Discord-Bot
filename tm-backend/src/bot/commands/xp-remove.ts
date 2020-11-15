import { bot } from '../bot'
import { Command, CommandContext } from '../bot/Command'
import { GuildMember } from 'discord.js'
import { changeUserXP } from '../components/xp'

export default class XPRemoveCommand extends Command {
	constructor() {
		super()

		this.name = 'xp-remove'
	}

	async execute({ message }: CommandContext) {
		if (!message.member?.hasPermission('MANAGE_GUILD')) {
			return message.reply(
				'❌ You do not have the permission to use this command.'
			)
		}

		const parts = message.content.split(' ')

		if (parts.length < 3) {
			return message.reply('❌ Usage `!xp-remove <user-id> <xp>`.')
		}

		let user: GuildMember
		try {
			let userId = parts[1]
			if (userId.startsWith('<')) userId = userId.slice(2)
			if (userId.endsWith('>')) userId = userId.slice(0, -1)
			if (userId.startsWith('!')) userId = userId.slice(1)

			user = await bot.getGuild().members.fetch(userId)
		} catch (e) {
			return message.reply('❌ User not found.')
		}

		const changeAmount = parseInt(parts[2])
		if (isNaN(changeAmount) || changeAmount < 0) {
			return message.reply('❌ XP amount must be one or more.')
		}

		await changeUserXP(user.id, -changeAmount)

		await message.reply('Experience points updated')
	}
}
