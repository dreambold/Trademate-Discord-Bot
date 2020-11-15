import { server } from '../../../server'
import { DbLevellingRanks } from '../../../../common/db/models/levelling-rank'
import { DbLevellingChannelSettings } from '../../../../common/db/models/levelling-channel-settings'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/ranks',
		NeedsPermissionMiddleware('VIEW_RANKS'),
		async ctx => {
			const ranks = await DbLevellingRanks.findAll({
				order: [['levelRequired', 'ASC']]
			})

			ctx.body = {
				data: {
					ranks
				}
			}
		}
	)

	server.router.post(
		'/api/admin/ranks',
		NeedsPermissionMiddleware('EDIT_RANKS'),
		async ctx => {
			const newRanks = ctx.request.body as any[]

			const ranks = await DbLevellingRanks.findAll({
				order: [['levelRequired', 'ASC']]
			})

			for (let rank of ranks) {
				const newRank = newRanks.find(r => rank.id === r.id)

				// Delete ranks that aren't present anymore
				if (!newRank) {
					await rank.destroy()
				}
				// Edit the rank otherwise
				else {
					rank.set(newRank)
					await rank.save()
				}
			}

			// Insert ranks that don't have an ID
			for (let rank of newRanks.filter(r => !r.id)) {
				await DbLevellingRanks.create(rank)
			}

			// Send the new, fresh ranks out
			ctx.body = {
				data: {
					ranks: await DbLevellingRanks.findAll({
						order: [['levelRequired', 'ASC']]
					})
				}
			}
		}
	)

	server.router.get(
		'/api/admin/levelling-multipliers',
		NeedsPermissionMiddleware('VIEW_RANKS'),
		async ctx => {
			const channelsSettings = await DbLevellingChannelSettings.findAll({
				order: [['createdAt', 'ASC']]
			})

			ctx.body = {
				data: {
					channelsSettings
				}
			}
		}
	)

	server.router.post(
		'/api/admin/levelling-multipliers',
		NeedsPermissionMiddleware('EDIT_RANKS'),
		async ctx => {
			const newMultipliers = ctx.request.body as any[]

			const multipliers = await DbLevellingChannelSettings.findAll({
				order: [['createdAt', 'ASC']]
			})

			for (let multiplier of multipliers) {
				const newMultiplier = newMultipliers.find(r => multiplier.id === r.id)

				// Delete ranks that aren't present anymore
				if (!newMultiplier) {
					await multiplier.destroy()
				}
				// Edit the rank otherwise
				else {
					multiplier.set(newMultiplier)
					await multiplier.save()
				}
			}

			// Insert ranks that don't have an ID
			for (let rank of newMultipliers.filter(r => !r.id)) {
				await DbLevellingChannelSettings.create(rank)
			}

			// Send the new, fresh ranks out
			ctx.body = {
				data: {
					channelsSettings: await DbLevellingChannelSettings.findAll({
						order: [['createdAt', 'ASC']]
					})
				}
			}
		}
	)
}
