import { server } from '../server'
import moment = require('moment')

export function init() {
	server.router.use(['/:lang/', '/:lang/:page'], (ctx, next) => {
		ctx.state.__ = (str: string) => ctx.state.localeStrings[str] || str
		ctx.state.asset = (asset: string) => `/public/${asset}`
		ctx.state.link = (str: string) => `/${ctx.params.lang}${str}`
		ctx.state.request = ctx.request
		ctx.state.params = ctx.params
		ctx.state.moment = moment

		return next()
	})
}
