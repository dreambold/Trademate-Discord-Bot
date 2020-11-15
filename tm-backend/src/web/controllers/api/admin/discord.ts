import { server } from '../../../server'
import { bot } from '../../../../bot/bot'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/discord/channels',
		NeedsPermissionMiddleware('VIEW_DASHBOARD'),
		async ctx => {
			ctx.body = {
				data: {
					channels: bot.getGuild().channels.cache.map(c => {
						return {
							id: c.id,
							name: c.name,
							type: c.type,
							guildId: c.guild.id,
							position: c.position
						}
					})
				}
			}
		}
	)

	server.router.get(
		'/api/admin/discord/roles',
		NeedsPermissionMiddleware('VIEW_DASHBOARD'),
		async ctx => {
			ctx.body = {
				data: {
					roles: bot
						.getGuild()
						.roles.cache.filter(r => !r.managed)
						.map(r => {
							return {
								id: r.id,
								name: r.name,
								color: r.color,
								guildId: r.guild.id,
								hoist: r.hoist,
								position: r.position
							}
						})
				}
			}
		}
	)
}
