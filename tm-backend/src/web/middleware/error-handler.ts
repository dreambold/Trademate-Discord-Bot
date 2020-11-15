import { server } from '../server'
import { APIError } from '../utils/misc'

export function init() {
	server.router.use(async (ctx, next) => {
		try {
			await next()
		} catch (e) {
			if (e instanceof APIError) {
				if (e.message !== 'Access denied') console.error(e)

				ctx.body = {
					code: e.code,
					error: e.message
				}
				// ctx.status = e.code
			} else if (e.errors) {
				console.error(e)

				ctx.body = {
					code: 400,
					error: e.errors[0].message
				}
			}
		}
	})
}
