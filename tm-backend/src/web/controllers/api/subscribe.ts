import { server } from '../../server'
import { DbUser } from '../../../common/db/models/user'
import { DbSubscription } from '../../../common/db/models/subscription'
import { APIError } from '../../utils/misc'
import {
	getStripeCustomer,
	setCustomerPaymentMethod,
	cancelSubscription,
	payUnpaidInvoice,
	createNewSubscription,
	refreshSubscriptionStatus,
	getStripePlan,
	planIsDollarTrial,
	createNewSubscriptionWithTrial,
	createPayment
} from '../../components/billing'
import { sendEmailTemplate } from '../../utils/mail'
import { syncMembers } from '../../../bot/components/sync-membership'
import { Mailchimp } from '../../components/mailchimp'
import { DbReferralLink } from '../../../common/db/models/referral-link'
import { DbReferralEntry } from '../../../common/db/models/referral-entry'

export function init() {
	server.router.post('/api/subscribe', async ctx => {
		const body = ctx.request.body
		const user = await getUser(ctx)
		const customer = await getStripeCustomer(user)
		let subscription = (await user.$get('subscription')) as DbSubscription

		// Post-3D Secure
		if (body.done) {
			if (planIsDollarTrial(body.planId)) {
				await createNewSubscriptionWithTrial(
					subscription,
					body.planId,
					7 * 24 * 3600
				)
			} else {
				await refreshSubscriptionStatus(subscription)
			}
			ctx.body = {
				data: {
					ok: ['active', 'trialing'].includes(subscription.status)
				}
			}
			if ((ctx as any).session.referralLinkId) {
				await applyUserReferral(
					user,
					(ctx as any).session.referralLinkId
				).catch(console.error)
			}
			return
		}

		if (body.cardToken) {
			try {
				await setCustomerPaymentMethod(customer.id, body.cardToken)
			} catch (e) {
				if ((e.type as string).startsWith('Stripe')) {
					throw new APIError('Your card was rejected.')
				} else {
					throw e
				}
			}
		}

		// User changed his plan ID
		// => Cancel it and re-create
		if (
			subscription &&
			subscription.stripeSubscriptionId &&
			subscription.planId !== body.planId
		) {
			await cancelSubscription(subscription)
		}

		// Same subscription, just need to pay
		let info: any
		if (subscription && subscription.status === 'incomplete') {
			info = await payUnpaidInvoice(user)
		} else {
			if (planIsDollarTrial(body.planId)) {
				info = await createPayment(subscription.stripeCustomerId, 100)

				if (info.paymentStatus === 'succeeded') {
					await createNewSubscriptionWithTrial(
						subscription,
						body.planId,
						7 * 24 * 3600
					)
				}
			} else {
				info = await createNewSubscription(subscription, body.planId)
			}

			if (info.paymentStatus === 'succeeded') {
				sendEmailTemplate(
					`${user.name} <${user.email}>`,
					'newMemberEmail',
					{}
				).catch(console.error)
			}
		}

		if (info.paymentStatus === 'succeeded') {
			syncMembers().catch(console.error)
			subscription.setDataValue('createdAt', new Date())
			await subscription.save()

			if ((ctx as any).session.referralLinkId) {
				await applyUserReferral(
					user,
					(ctx as any).session.referralLinkId
				).catch(console.error)
			}
		}

		if (body.subscribeNewsletter) {
			Mailchimp.subscribeToNewsletter({
				email: user.email,
				firstName: user.name.split(' ')[0],
				lastName: user.name
					.split(' ')
					.slice(1)
					.join(' ')
			})
				.then(() => {
					Mailchimp.updateEmailTags(user.email, ['paid-member'])
				})
				.catch(console.error)
		}

		ctx.body = {
			data: info
		}
	})
}

async function applyUserReferral(
	user: DbUser,
	referralLinkId: number | string
) {
	const subscription = (await user.$get('subscription')) as DbSubscription
	if (subscription.status !== 'active') return

	const referral = await DbReferralLink.findByPk(referralLinkId)
	if (!referral) return

	const [entry, isNew] = await DbReferralEntry.findOrBuild({
		where: {
			referralLinkId: referral.id,
			userId: user.id
		}
	})
	if (!isNew) return

	const plan = await getStripePlan(subscription.planId)

	entry.firstInvoiceAmount = plan.amount
	await entry.save()
}

async function getUser(ctx): Promise<DbUser> {
	if (ctx.request.body && ctx.request.body.email) {
		const email = ('' + ctx.request.body.email).trim().toLowerCase()

		const user = await DbUser.findOne({
			where: {
				email
			},
			include: [DbSubscription]
		})

		if (user) {
			if (
				!user.subscription ||
				!['active', 'trialing'].includes(user.subscription!.status)
			) {
				ctx.session!.userId = user.id
				return user
			}

			throw new APIError('This email is already taken.')
		} else {
			const user = await DbUser.create({
				email,
				name: ctx.request.body.name
			})

			ctx.session!.userId = user.id

			return user
		}
	}

	if (ctx.state.user) return ctx.state.user

	throw new APIError('Invalid request.')
}
