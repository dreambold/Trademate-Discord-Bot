import { server } from '../server'
import { DbUser } from '../../common/db/models/user'
import { DbDiscordAccount } from '../../common/db/models/discord-account'

export function init() {
	server.router.use(async (ctx, next) => {
		if ((ctx as any).session.userId) {
			ctx.state.user = await DbUser.findOne({
				where: {
					id: (ctx as any).session.userId
				},
				include: [DbDiscordAccount]
			})
		}

		return next()
	})

	server.router.use(['/api/user', '/api/user/(.*)'], async (ctx, next) => {
		if (!ctx.state.user) {
			return ctx.redirect('/')
		}

		return next()
	})
}
