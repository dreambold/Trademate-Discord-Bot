import { server } from '../../server'
import { DbReferralLink } from '../../../common/db/models/referral-link'

export function init() {
	server.router.get('/r/:referralId', async ctx => {
		const referralLink = await DbReferralLink.findOne({
			where: {
				code: ctx.params.referralId
			}
		})

		if (referralLink) {
			;(ctx as any).session.referralLinkId = referralLink.id
		}

		return ctx.redirect('/')
	})
}
