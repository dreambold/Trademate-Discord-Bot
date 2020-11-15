import { bot } from '../bot'
import { Command, CommandContext } from '../bot/Command'
import { GuildMember } from 'discord.js'
import { DbTrial } from '../../common/db/models/trial'
import moment from 'moment'
import { checkTrials } from '../components/sync-trials'

export default class GiveTrialCommand extends Command {
	constructor() {
		super()

		this.name = 'give-trial'
	}

	async execute({ message }: CommandContext) {
		if (!message.member?.hasPermission('MANAGE_GUILD')) {
			return message.reply(
				'❌ You do not have the permission to use this command.'
			)
		}

		const parts = message.content.split(' ')

		if (parts.length < 3) {
			return message.reply('❌ Usage `!give-trial <user-id> 30d`.')
		}

		let user: GuildMember
		try {
			user = await bot.getGuild().members.fetch(parts[1])
		} catch (e) {
			return message.reply('❌ User not found.')
		}

		const length = parseInt(parts[2])
		if (isNaN(length) || length < 0) {
			return message.reply('❌ Length must be zero or more days.')
		}

		let [dbTrial] = await DbTrial.findOrBuild({
			where: {
				discordUserId: user.id
			}
		})
		dbTrial.endsAt = moment()
			.add(length, 'days')
			.toISOString() as any

		await dbTrial.save()

		await message.reply('✅ Trial added.')

		checkTrials().catch(console.error)
	}
}
