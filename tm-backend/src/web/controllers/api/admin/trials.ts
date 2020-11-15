import { server } from '../../../server'
import { bot } from '../../../../bot/bot'
import { DbTrial } from '../../../../common/db/models/trial'
import { Op } from 'sequelize'
import moment from 'moment'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/trials',
		NeedsPermissionMiddleware('VIEW_TRIALS'),
		async ctx => {
			const trials = await DbTrial.findAll({
				where: {
					endsAt: {
						[Op.gte]: new Date().toISOString()
					}
				}
			})

			const respData = trials
				.map(t => {
					const discordMember = bot.client.users.cache.get(t.discordUserId)

					if (!discordMember) return

					return {
						tag: discordMember.tag,
						discordUserId: discordMember.id,
						daysIn: moment().diff(t.updatedAt, 'days'),
						daysLeft: moment(t.endsAt).diff(moment(), 'days') + 1
					}
				})
				.filter(t => !!t)

			ctx.body = {
				data: {
					trials: respData,
					count: respData.length
				}
			}
		}
	)
}
