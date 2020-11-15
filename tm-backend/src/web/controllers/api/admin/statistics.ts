import { server } from '../../../server'
import { tempValueCache } from '../../../utils/misc'
import { DbSubscription } from '../../../../common/db/models/subscription'
import { DbUser } from '../../../../common/db/models/user'
import { Op } from 'sequelize'
import moment = require('moment')
import { getStripeSubscriptions } from '../../../utils/stripe'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

const subscriptionsCache = tempValueCache<any>(120)

export function init() {
	server.router.get(
		'/api/admin/statistics',
		NeedsPermissionMiddleware('VIEW_STATISTICS'),
		async ctx => {
			let subscriptions = subscriptionsCache()

			if (!subscriptions) {
				subscriptions = subscriptionsCache(await getStripeSubscriptions())
			}

			const monthlyEarnings = Math.floor(
				subscriptions.reduce(
					(val, sub) =>
						val +
						sub.plan.amount /
							((sub.plan.interval === 'year' ? 12 : 1) *
								sub.plan.interval_count),
					0
				)
			)

			// Customer churn
			const lostCustomersCount = await DbUser.count({
				where: {},
				include: [
					{
						model: DbSubscription,
						where: {
							[Op.and]: {
								status: {
									[Op.notIn]: ['active', 'trialing']
								},
								updatedAt: {
									[Op.gt]: moment()
										.subtract(1, 'month')
										.toISOString()
								}
							}
						}
					}
				]
			})
			const activeCustomersCount = await DbUser.count({
				where: {},
				include: [
					{
						model: DbSubscription,
						where: {
							status: {
								[Op.in]: ['trialing', 'active']
							}
						}
					}
				]
			})

			let churn = 0
			if (lostCustomersCount > 0) {
				churn = lostCustomersCount / (activeCustomersCount + lostCustomersCount)

				churn = Math.round(100 * churn) / 100
			}

			ctx.body = {
				data: {
					statistics: [
						{
							slug: 'monthly-earnings',
							text: 'Monthly earnings',
							value: `$${monthlyEarnings / 100} USD`
						},
						{
							slug: 'customer-churn',
							text: 'Customer churn during the last 30 days',
							value: (churn * 100).toFixed(2) + '%'
						},
						{
							slug: 'member-count',
							text: 'Current member count',
							value: '' + activeCustomersCount
						}
					]
				}
			}
		}
	)
}
