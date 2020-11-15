import { server } from '../../../server'
import { DbUser } from '../../../../common/db/models/user'
import { APIError } from '../../../utils/misc'

export function init() {
	server.router.post('/api/user/email', async ctx => {
		const body = ctx.request.body
		const user: DbUser = ctx.state.user
		const email = ('' + body.email).toLowerCase()

		if (email === user.email) {
			ctx.body = {}
			return
		}

		const foundUser = await DbUser.findOne({
			where: {
				email
			}
		})

		if (foundUser)
			throw new APIError('Could not change your email to this email.')

		user.email = email
		await user.save()

		ctx.body = {}
	})
}
