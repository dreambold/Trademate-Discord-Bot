import { CronJob } from 'cron'
import { server } from '../server'
import { getStripeSubscriptions } from '../utils/stripe'
import { DbSubscription } from '../../common/db/models/subscription'
import { syncMembers } from '../../bot/components/sync-membership'

export async function checkStripeSubscriptions() {
	let subscriptions = await getStripeSubscriptions()

	let dbSubscriptions = await DbSubscription.findAll()

	await Promise.all(
		dbSubscriptions.map(dbSubscription => {
			const sub = subscriptions.find(
				sub =>
					sub.customer === dbSubscription.stripeCustomerId &&
					sub.plan.id === dbSubscription.planId
			)

			dbSubscription.status = sub ? sub.status : 'canceled'

			return dbSubscription.save()
		})
	)

	await syncMembers()
}

export function init() {
	new CronJob(
		'0 */30 * * * *',
		() => {
			checkStripeSubscriptions().catch(err => {
				console.log(err)
				server.logger.error({ err })
			})
		},
		undefined,
		true
	)
}
