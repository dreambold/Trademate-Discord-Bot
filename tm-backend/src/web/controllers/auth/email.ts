import { server } from '../../server'
import { DbLoginToken } from '../../../common/db/models/login-token'
import { DbUser } from '../../../common/db/models/user'
import { sendEmailTemplate } from '../../utils/mail'

export function init() {
	/**
	 * Endpoint to create a loginToken and send it to the address of the user.
	 * This allows for password-less identification.
	 */
	server.router.post('/auth/email', ctx => {
		ctx.body = {}

		const bg = async () => {
			const user = await DbUser.findOne({
				where: {
					email: ('' + ctx.query.email).trim().toLowerCase()
				}
			})

			if (!user) return

			// Create a token
			const token = await DbLoginToken.createTokenFor(user)

			// Send the email
			sendEmailTemplate(`${user.name} <${user.email}>`, 'loginViaEmail', {
				dashboard_link: `${process.env.API_BASE_URI}/auth/email?token=${token.token}`
			}).catch(console.error)
		}

		bg().catch(e => console.error(e))
	})

	/**
	 * Callback that the user is sent to when he asks to login with email. The
	 * link is in the email. This proves ownership of the email, and as such
	 * allows a user to login. Useful to login when a Discord account is not
	 * linked yet.
	 */
	server.router.get('/auth/email', async ctx => {
		const dbLoginToken = await DbLoginToken.findOne({
			where: {
				token: ctx.query.token
			},
			include: [DbUser]
		})

		if (!dbLoginToken) {
			ctx.body = 'Unauthorized.'
			return
		}

		;(ctx as any).session.userId = dbLoginToken.user.id

		await dbLoginToken.destroy()

		if (dbLoginToken.user.rank > 1) {
			return ctx.redirect(process.env.WEB_BASE_URI + '/#/admin')
		}

		return ctx.redirect(process.env.WEB_BASE_URI + '/#/account')
	})
}
