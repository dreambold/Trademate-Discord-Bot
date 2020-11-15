import { server } from '../../server'
import { getActivePlans, getStripe } from '../../utils/stripe'
import { DbUser } from '../../../common/db/models/user'
import { DbSubscription } from '../../../common/db/models/subscription'
import moment = require('moment')
import { DbLevellingUserLevel } from '../../../common/db/models/levelling-user-level'
import { planIsDollarTrial } from '../../components/billing'
import { getJsonConfig } from '../../../common/config'

export function init() {
	const getSubscription = async (user?: DbUser) => {
		if (!user) {
			return {
				setUp: false
			}
		}

		const stripe = getStripe()
		const subscription = (await user.$get('subscription')) as DbSubscription

		if (
			!subscription ||
			!subscription.planId ||
			!subscription.stripeCustomerId
		) {
			return {
				setUp: false
			}
		}

		let stripeSubscription: any
		if (subscription.stripeSubscriptionId) {
			stripeSubscription = await stripe.subscriptions.retrieve(
				subscription.stripeSubscriptionId
			)
		}

		let openInvoices = await stripe.invoices.list({
			customer: subscription.stripeCustomerId,
			status: 'open'
		})

		const amountDue = openInvoices.data.reduce(
			(prev, curr) => prev + curr.amount_remaining,
			0
		)

		const plans = await getActivePlans(true)
		const plan = plans.find(p => p.id === subscription.planId)!

		return {
			setUp: true,
			plan: {
				id: plan.id,
				name: plan.nickname,
				amount: plan.amount,
				interval:
					plan.interval === 'year'
						? 12 * plan.interval_count
						: plan.interval_count
			},
			amountDue,
			invoicesDue: openInvoices.length,
			planId: subscription.planId,
			hasHadDiscount: subscription.hasHadDiscount,
			willCancel:
				stripeSubscription &&
				stripeSubscription.cancel_at_period_end &&
				moment(stripeSubscription.current_period_end * 1000).toDate()
		}
	}

	server.router.get('/api/info', async ctx => {
		const user = ctx.state.user as DbUser
		const rawPlans = await getActivePlans()

		const plans = rawPlans.map(plan => {
			return {
				id: plan.id,
				product: plan.product,
				name: plan.nickname,
				amount: plan.amount,
				dollarTrial: planIsDollarTrial(plan.id),
				interval:
					plan.interval === 'year'
						? 12 * plan.interval_count
						: plan.interval_count
			}
		})

		ctx.body = {
			status: 200,
			data: {
				user: user,
				subscription: await getSubscription(user),
				stripeKey: process.env.STRIPE_PUBLIC_KEY,
				urls: {
					web: process.env.WEB_BASE_URI,
					api: process.env.API_BASE_URI
				},
				hasNewsletter: !!process.env.MAILCHIMP_LIST_ID,
				xpAvailable:
					user &&
					(await user.$get('discordAccount')) &&
					(
						await DbLevellingUserLevel.findOne({
							where: {
								discordUserId: user.discordAccount.discordUserId
							}
						})
					)?.xpAvailable,
				products: getJsonConfig().products,
				plans
			}
		}
	})
}
