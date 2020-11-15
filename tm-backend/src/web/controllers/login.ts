import { server } from '../server'

export function init() {
	server.router.get('/login', ctx => {
		return ctx.redirect(
			`https://discordapp.com/api/oauth2/authorize?client_id=${
				process.env.DISCORD_CLIENT_ID
			}&redirect_uri=${encodeURIComponent(
				`${process.env.WEB_BASE_URI}/auth/discord`
			)}&response_type=code&scope=identify%20email`
		)
	})

	server.router.get('/logout', ctx => {
		;(ctx as any).session.userId = ''
		return ctx.redirect('/')
	})
}
