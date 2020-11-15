import { server } from '../../../server'
import { DbReferralLink } from '../../../../common/db/models/referral-link'
import { DbReferralEntry } from '../../../../common/db/models/referral-entry'
import { DbUser } from '../../../../common/db/models/user'
import { APIError } from '../../../utils/misc'
import { DbDiscordAccount } from '../../../../common/db/models/discord-account'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/referral-links',
		NeedsPermissionMiddleware('VIEW_REFERRALS'),
		async ctx => {
			const referrals = await DbReferralLink.findAll({
				where: ctx.query.userId
					? {
							active: true,
							userId: ctx.query.userId
					  }
					: {
							active: true
					  },
				include: [
					DbReferralEntry,
					{
						model: DbUser,
						include: [DbDiscordAccount]
					}
				]
			})

			ctx.body = {
				data: {
					referralLinks: referrals.map(r => {
						return {
							...r.toJSON(),
							entries: undefined,
							entriesCount: r.entries.length,
							firstInvoiceTotal:
								r.entries.reduce(
									(prev, curr) => prev + curr.firstInvoiceAmount,
									0
								) / 100,
							referralCount: r.entries.length
						}
					})
				}
			}
		}
	)

	server.router.del(
		'/api/admin/referral-links',
		NeedsPermissionMiddleware('EDIT_REFERRALS'),
		async ctx => {
			const referralLink = await DbReferralLink.findOne({
				where: {
					id: ctx.query.id
				}
			})

			if (referralLink) {
				referralLink.active = false
				await referralLink.save()
			}

			ctx.body = {}
		}
	)

	server.router.get(
		'/api/admin/user-referrals',
		NeedsPermissionMiddleware('VIEW_REFERRALS'),
		async ctx => {
			const referrals = await DbReferralLink.findAll({
				where: {
					userId: ctx.query.userId
				},
				include: [DbReferralEntry]
			})

			let resp: any[] = []

			for (let referral of referrals) {
				resp = resp.concat(
					referral.entries.map(e => {
						return {
							...e.toJSON(),
							referralCode: referral.code
						}
					})
				)
			}

			ctx.body = {
				data: {
					referrals: resp,
					referralLinks: referrals.map(r => {
						return {
							...r.toJSON(),
							firstInvoiceTotal: r.entries.reduce(
								(prev, curr) => prev + curr.firstInvoiceAmount,
								0
							),
							referralCount: r.entries.length
						}
					})
				}
			}
		}
	)

	server.router.post(
		'/api/admin/user-referrals',
		NeedsPermissionMiddleware('EDIT_REFERRALS'),
		async ctx => {
			const user = await DbUser.findByPk(ctx.query.userId)
			if (!user) throw new APIError('User not found')

			const referralLink = await DbReferralLink.createForUser(
				user,
				ctx.query.askedCode
			)

			ctx.body = {
				data: {
					referralLink: referralLink.toJSON()
				}
			}
		}
	)
}
