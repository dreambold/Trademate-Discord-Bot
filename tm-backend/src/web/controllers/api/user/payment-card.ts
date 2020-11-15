import { server } from '../../../server'
import { DbUser } from '../../../../common/db/models/user'
import { getStripe } from '../../../utils/stripe'
import {
	payUnpaidInvoice,
	getStripeCustomer
} from '../../../components/billing'
import { APIError } from '../../../utils/misc'

export function init() {
	/**
	 * Updates the user's card, and also automatically pays any invoices that
	 * are left open
	 */
	server.router.post('/api/user/payment-card', async ctx => {
		const user: DbUser = ctx.state.user

		const stripe = getStripe()
		const customer = await getStripeCustomer(user)

		try {
			await stripe.customers.update(customer.id, {
				source: ctx.request.body.cardToken
			})
		} catch (e) {
			if ((e.type as string).startsWith('Stripe')) {
				throw new APIError('Your card was rejected.')
			} else {
				throw e
			}
		}

		const res = await payUnpaidInvoice(user)

		ctx.body = { data: res || {} }
	})
}
