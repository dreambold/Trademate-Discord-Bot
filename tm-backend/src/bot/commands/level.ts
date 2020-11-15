import { Command, CommandContext } from '../bot/Command'
import { DbLevellingUserLevel } from '../../common/db/models/levelling-user-level'
import { levelFromXP, levelDelimiters } from '../components/xp'
import { DbLevellingRanks } from '../../common/db/models/levelling-rank'
import { Op } from 'sequelize'

export default class LevelCommand extends Command {
	constructor() {
		super()

		this.name = 'level'
	}

	async execute({ message }: CommandContext) {
		const userLevel = await DbLevellingUserLevel.findOne({
			where: {
				discordUserId: message.author.id
			}
		})

		if (!userLevel) {
			await message.reply(`You do not currently have a level.`)
			return
		}

		const level = levelFromXP(userLevel.xp)
		const highestRankReached = await DbLevellingRanks.findOne({
			where: {
				levelRequired: {
					[Op.lte]: level
				}
			},
			limit: 1,
			order: [['levelRequired', 'DESC']]
		})

		const nextLevelXP =
			level !== 100 ? levelDelimiters[level + 1] - userLevel.xp : -1

		if (highestRankReached) {
			await message.reply(
				`You are level **${level}** and have reached rank ${highestRankReached.name}.`
			)
		} else {
			await message.reply(
				`You are level **${level}**.` +
					(nextLevelXP === -1
						? ' You have maxed out your level.'
						: ` Next level in ${nextLevelXP} XP.`)
			)
		}
	}
}
