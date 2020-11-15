import { server } from '../server'
import { DbUser } from '../../common/db/models/user'
import { DbReferralLink } from '../../common/db/models/referral-link'

export function init() {
	server.router.get('/r/:code', async ctx => {
		let referralLink = await DbReferralLink.findOne({
			where: {
				code: ctx.params.code
			}
		})

		if (referralLink && referralLink.active)
			(ctx as any).session.referralLinkId = referralLink.id

		ctx.redirect('/')
	})
}
