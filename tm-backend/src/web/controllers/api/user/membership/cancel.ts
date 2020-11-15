import { server } from '../../../../server'
import { DbUser } from '../../../../../common/db/models/user'
import { DbSubscription } from '../../../../../common/db/models/subscription'
import {
	cancelSubscription,
	applySubscriptionCoupon
} from '../../../../components/billing'
import { DbUsinFlow } from '../../../../../common/db/models/usin-flow'
import { DbUsinEntry } from '../../../../../common/db/models/usin-entry'
import { DbDiscordAccount } from '../../../../../common/db/models/discord-account'
import { Mailchimp } from '../../../../components/mailchimp'

export function init() {
	server.router.get('/api/user/membership/cancel', async ctx => {
		const user: DbUser = ctx.state.user

		const flow = await DbUsinFlow.findOne({
			where: {
				name: 'CancellationPoll'
			}
		})

		if (ctx.query.flow) {
			ctx.body = {
				data: flow
			}
		} else {
			const subscription = (await user.$get('subscription')) as DbSubscription
			ctx.body = {
				data: {
					discountAvailable:
						!subscription.hasHadDiscount && !!flow && flow.blocks.length > 0
				}
			}
		}
	})

	server.router.post('/api/user/membership/get-discount', async ctx => {
		const user: DbUser = ctx.state.user
		const subscription = (await user.$get('subscription')) as DbSubscription

		await savePoll(ctx.request.body.flow, user)

		await applySubscriptionCoupon(
			subscription,
			process.env.STRIPE_CANCELLATION_COUPON_ID
		)

		subscription.hasHadDiscount = true
		await subscription.save()

		ctx.body = {
			data: {}
		}
	})

	server.router.post('/api/user/membership/cancel', async ctx => {
		const user: DbUser = ctx.state.user
		const subscription = (await user.$get('subscription')) as DbSubscription

		await Promise.all([
			savePoll(ctx.request.body.flow, user),
			Mailchimp.updateEmailTags(user.email, ['canceled'])
		]).catch(() => {})

		if (subscription && subscription.status === 'active') {
			await cancelSubscription(subscription, true)

			ctx.body = {
				data: {
					ok: true
				}
			}
			return
		}

		ctx.body = {
			data: {
				ok: false
			}
		}
	})

	async function savePoll(data: any, user: DbUser) {
		if (!data) return
		const flow = await DbUsinFlow.findOne({
			where: {
				name: 'CancellationPoll'
			}
		})
		const discordAccount = (await user.$get(
			'discordAccount'
		)) as DbDiscordAccount
		await DbUsinEntry.create({
			flowId: flow!.id,
			blocks: data.blocks,
			discordUserId: discordAccount && discordAccount.discordUserId,
			discordUserTag:
				discordAccount &&
				discordAccount.username + '#' + discordAccount.discriminator
		})
	}
}
