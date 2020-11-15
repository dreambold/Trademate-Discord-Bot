import { server } from '../../server'
import { DbUser } from '../../../common/db/models/user'
import { DbLevellingUserLevel } from '../../../common/db/models/levelling-user-level'
import { Op } from 'sequelize'
import { DbDiscordGuildMember } from '../../../common/db/models/discord-guild-member'
import { levelFromXP } from '../../../bot/components/xp'

export function init() {
	server.router.get('/api/ranks', async ctx => {
		const user = ctx.state.user as DbUser | undefined
		const discordAccount = await user?.$get('discordAccount')
		const userRank =
			discordAccount &&
			(await DbLevellingUserLevel.findOne({
				where: {
					discordUserId: discordAccount.discordUserId
				},
				include: [DbDiscordGuildMember]
			}))
		const userRankPosition =
			userRank &&
			(await DbLevellingUserLevel.count({
				where: {
					xp: {
						[Op.gte]: userRank.xp
					}
				}
			}))

		const topRanks = await DbLevellingUserLevel.findAll({
			order: [['xp', 'DESC']],
			limit: 50,
			include: [DbDiscordGuildMember]
		})

		ctx.body = {
			data: {
				userRank:
					userRank &&
					[userRank].map(r => {
						const rank = r.toJSON() as any
						rank.position = userRankPosition
						rank.discordAccount = r.discordAccount?.toJSON()
						rank.level = levelFromXP(rank.xp)
						return rank
					})[0],
				topRanks: topRanks.map((r, i) => {
					const rank = r.toJSON() as any
					rank.position = i + 1
					rank.discordAccount = r.discordAccount?.toJSON()
					rank.level = levelFromXP(rank.xp)
					return rank
				})
			}
		}
	})
}
