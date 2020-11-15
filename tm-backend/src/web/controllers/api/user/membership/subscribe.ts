import { server } from '../../../../server'
import { DbUser } from '../../../../../common/db/models/user'
import { getActivePlans } from '../../../../utils/stripe'
import { DbSubscription } from '../../../../../common/db/models/subscription'
import { APIError } from '../../../../utils/misc'
import {
	getStripeCustomer,
	updateCurrentSubscription,
	createNewSubscription
} from '../../../../components/billing'

export function init() {
	/**
	 * Allows a user to subscribe or change subscription
	 */
	server.router.post('/api/user/membership/subscribe', async ctx => {
		const user: DbUser = ctx.state.user
		const body = ctx.request.body
		const planId: string = body.planId

		// This ensures a customer exists on Stripe's side
		await getStripeCustomer(user)

		// Fetch a subscription entry
		//
		// We do this first as to not have to fetch plans if the user tries to
		// change plan to his current plan (noop)
		const subscription = (await user.$get('subscription')) as DbSubscription

		if (subscription.planId === planId && subscription.status !== 'canceled')
			throw new APIError('Cannot change plan to your current plan', 401)

		// Make sure the planId exists and is not archived
		const plans = await getActivePlans()
		if (!plans.find(plan => plan.id === planId))
			throw new APIError('The requested plan could not be found.', 401)

		// Updating pipeline
		let res
		if (
			subscription.stripeSubscriptionId &&
			subscription.status !== 'canceled'
		) {
			res = await updateCurrentSubscription(subscription, planId)
		} else {
			res = await createNewSubscription(subscription, planId)
		}

		await subscription.save()

		ctx.body = {
			data: res || {}
		}
	})
}
