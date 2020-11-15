import { DbLevellingUserLevel } from '../../common/db/models/levelling-user-level'
import { Op, Sequelize } from 'sequelize'
import { levelDelimiters, levelFromXP } from './xp'
import moment from 'moment'
import { bot } from '../bot'

export function init() {
	setInterval(() => {
		sendReminders().catch(console.error)
	}, 4 * 60 * 1000)
}

async function sendReminders() {
	// Find all user levels, at level two or above, that haven't sent a message
	// in a week, and there hasn't been a reminder since their last message
	const remindersToSend = await DbLevellingUserLevel.findAll({
		where: {
			xp: {
				[Op.gte]: levelDelimiters[2], // Greater than level two
				[Op.lt]: levelDelimiters[100] // Users at level 100 can't level up, so no reminder
			},
			lastMessageAt: {
				[Op.lt]: moment()
					.subtract(1, 'week')
					.toDate()
			},
			lastReminderAt: {
				[Op.or]: [
					null,
					{
						[Op.and]: [
							{
								[Op.lt]: Sequelize.col('lastMessageAt')
							},
							{
								[Op.lt]: moment()
									.subtract(1, 'week')
									.toDate()
							}
						]
					}
				]
			}
		}
	})

	await Promise.all(remindersToSend.map(sendReminder))
}

async function sendReminder(userLevel: DbLevellingUserLevel) {
	const level = levelFromXP(userLevel.xp)
	const nextLevelXP = levelDelimiters[level + 1] - userLevel.xp

	const member = await bot.getGuild().members.fetch(userLevel.discordUserId)

	if (member)
		await member.send(
			`We noticed it has been a while since your last message on the Trademate server.` +
				` You are currently level ${level} and will gain a level in ${nextLevelXP} XP.` +
				` Send a message now to continue ranking up!`
		)

	userLevel.lastReminderAt = new Date()
	await userLevel.save()
}
