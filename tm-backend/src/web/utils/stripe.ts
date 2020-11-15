import Stripe from 'stripe'
import { tempValueCache } from './misc'
import { StripePlan } from '../../common/interfaces'
import { getJsonConfig } from '../../common/config'

let stripeClient: Stripe
export let computedPlansActive = tempValueCache<StripePlan[]>(3600)
export let computedPlansWithInactive = tempValueCache<StripePlan[]>(3600)

export function getStripe() {
	if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)

	return stripeClient
}

export async function getActivePlans(
	allowInactive = false
): Promise<StripePlan[]> {
	if (computedPlansActive() && !allowInactive) return computedPlansActive()!
	if (computedPlansWithInactive() && allowInactive)
		return computedPlansWithInactive()!

	let plans = await getStripe().plans.list({
		limit: 100,
		active: true
	})

	if (allowInactive) {
		const inactivePlans = await getStripe().plans.list({
			limit: 100,
			active: false
		})

		plans.data = [...plans.data, ...inactivePlans.data]
	}

	const res = plans.data
		.filter(plan =>
			getJsonConfig().products.some(
				product => product.stripeProductId === plan.product
			)
		)
		.sort((plan, planb) => {
			return plan.amount - planb.amount
		})

	if (allowInactive) return computedPlansWithInactive(res)!
	else return computedPlansActive(res)!
}

export async function getStripeSubscriptions() {
	const stripe = getStripe()
	const plans = await getActivePlans(true)
	let subscriptions: any[] = []

	for (let plan of plans) {
		let hasMore = true
		let latest: string | undefined = undefined

		while (hasMore) {
			let subs = await stripe.subscriptions.list({
				limit: 100,
				plan: plan.id,
				starting_after: latest
			})

			if (subs.data.length > 0) latest = subs.data[subs.data.length - 1].id

			hasMore = subs.has_more

			subscriptions = subscriptions.concat(subs.data)
		}
	}

	return subscriptions
}
