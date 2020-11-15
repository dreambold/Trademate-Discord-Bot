import { server } from '../../server'

export function init() {
	server.router.get('/auth/logout', async ctx => {
		;(ctx as any).session.userId = null

		return ctx.redirect(process.env.WEB_BASE_URI)
	})
}
