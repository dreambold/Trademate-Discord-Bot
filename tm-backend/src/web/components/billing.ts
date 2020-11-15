import { DbSubscription } from '../../common/db/models/subscription'
import { getStripe } from '../utils/stripe'
import { DbUser } from '../../common/db/models/user'

export function init() {}

export async function getStripeCustomer(user: DbUser) {
	const stripe = getStripe()
	let [subscription] = await DbSubscription.findOrBuild({
		where: {
			userId: user.id
		}
	})
	let customer: any

	if (!subscription.stripeCustomerId) {
		customer = await stripe.customers.create({
			name: user.name,
			email: user.email
		})

		subscription.stripeCustomerId = customer.id
	} else {
		customer = await stripe.customers.retrieve(subscription.stripeCustomerId)
	}

	await subscription.save()

	return customer
}

export async function getStripePlan(planId: string) {
	const stripe = getStripe()

	return await stripe.plans.retrieve(planId)
}

export async function refreshSubscriptionStatus(subscription: DbSubscription) {
	const stripe = getStripe()

	const stripeSubscription = await stripe.subscriptions.retrieve(
		subscription.stripeSubscriptionId
	)

	subscription.status = stripeSubscription.status
	await subscription.save()
}

export async function updateCurrentSubscription(
	subscription: DbSubscription,
	planId: string
) {
	const stripe = getStripe()

	const stripeSubscription = await stripe.subscriptions.retrieve(
		subscription.stripeSubscriptionId
	)

	await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
		cancel_at_period_end: false,
		items: [
			{
				id: stripeSubscription.items.data[0].id,
				plan: planId
			}
		]
	})

	subscription.planId = planId
	await subscription.save()
}

export async function applySubscriptionCoupon(
	subscription: DbSubscription,
	coupon: string
) {
	const stripe = getStripe()

	await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
		coupon
	})
}

export async function createNewSubscription(
	subscription: DbSubscription,
	planId: string
) {
	const stripe = getStripe()

	const sub = await stripe.subscriptions.create({
		customer: subscription.stripeCustomerId,
		items: [
			{
				plan: planId
			}
		],
		expand: ['latest_invoice.payment_intent']
	})

	subscription.stripeSubscriptionId = sub.id
	subscription.status = sub.status
	subscription.planId = planId
	await subscription.save()

	return {
		paymentStatus: sub.latest_invoice?.payment_intent?.status,
		paymentIntentSecret: sub.latest_invoice?.payment_intent?.client_secret
	}
}

export function planIsDollarTrial(planId: string) {
	return process.env.DOLLAR_TRIAL_PLANS?.includes(planId) ?? false
}

export async function createNewSubscriptionWithTrial(
	subscription: DbSubscription,
	planId: string,
	trialLength: number
) {
	const stripe = getStripe()

	const sub = await stripe.subscriptions.create({
		customer: subscription.stripeCustomerId,
		trial_end: Math.floor(Date.now() / 1000) + trialLength,
		items: [
			{
				plan: planId
			}
		],
		expand: ['latest_invoice.payment_intent']
	})

	subscription.stripeSubscriptionId = sub.id
	subscription.status = sub.status
	subscription.planId = planId
	await subscription.save()

	return {
		paymentStatus: sub.latest_invoice?.payment_intent?.status,
		paymentIntentSecret: sub.latest_invoice?.payment_intent?.client_secret
	}
}

export async function createPayment(stripeCustomerId: string, amount: number) {
	const stripe = getStripe()

	const charge = await stripe.paymentIntents.create({
		customer: stripeCustomerId,
		amount,
		currency: 'usd',
		confirm: true,
		setup_future_usage: 'off_session'
	})

	return {
		paymentStatus: charge.status,
		paymentIntentSecret: charge.client_secret
	}
}

export async function cancelSubscription(
	subscription: DbSubscription,
	atPeriodEnd = false
) {
	// TODO: If the user cancels while there is an invoice that's unpaid (so he
	// cancells after a failed invoice), then we can immediately cancel that
	// invoice and the subscription, not at period end.
	const stripe = getStripe()

	stripe.subscriptions.update(subscription.stripeSubscriptionId, {
		cancel_at_period_end: atPeriodEnd
	})

	if (!atPeriodEnd) {
		subscription.stripeSubscriptionId = ''
		subscription.planId = ''
		subscription.status = 'canceled'
		await subscription.save()
	}
}

export async function setCustomerPaymentMethod(
	customerId: string,
	source: string
) {
	const stripe = getStripe()

	await stripe.customers.update(customerId, {
		source
	})
}

export async function payUnpaidInvoice(user: DbUser) {
	const subscription = (await user.$get('subscription')) as DbSubscription
	const stripe = getStripe()

	/**
	 * incomplete = First payment failed
	 * past_due = Renew failed
	 */
	if (!['incomplete', 'past_due'].includes(subscription.status)) return

	const stripeSubscription = await stripe.subscriptions.retrieve(
		subscription.stripeSubscriptionId,
		{
			expand: ['latest_invoice']
		}
	)

	let invoice
	try {
		invoice = await stripe.invoices.pay(stripeSubscription.latest_invoice.id, {
			expand: ['payment_intent']
		})
	} catch (e) {
		invoice = await stripe.invoices.retrieve(
			stripeSubscription.latest_invoice.id,
			{
				expand: ['payment_intent']
			}
		)
	}

	if (invoice.payment_intent.status === 'succeeded') {
		subscription.status = 'active'
		await subscription.save()
	}

	return {
		paymentStatus: invoice.payment_intent.status,
		paymentIntentSecret: invoice.payment_intent.client_secret
	}
}

/**
 * Extend the next billing date of a Stripe subscription. This will change the
 * subscription to a trial
 */
export async function extendSubscription(
	subscription: DbSubscription,
	days: number
) {
	const stripe = getStripe()

	const stripeSubscription = await stripe.subscriptions.retrieve(
		subscription.stripeSubscriptionId
	)

	await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
		trial_end: stripeSubscription.current_period_end + days * 3600 * 24
	})
}
