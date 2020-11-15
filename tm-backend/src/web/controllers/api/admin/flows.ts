import { server } from '../../../server'
import { DbUsinFlow } from '../../../../common/db/models/usin-flow'
import { APIError } from '../../../utils/misc'
import { dispatchFlow } from '../../../../bot/components/usin'
import { DbUsinEntry } from '../../../../common/db/models/usin-entry'
import { DbUsinOngoingEntry } from '../../../../common/db/models/usin-ongoing-entry'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/flows',
		NeedsPermissionMiddleware('VIEW_POLLS'),
		async ctx => {
			const flows = await DbUsinFlow.findAll()

			ctx.body = {
				data: {
					flows
				}
			}
		}
	)

	server.router.post(
		'/api/admin/flows',
		NeedsPermissionMiddleware('EDIT_POLLS'),
		async ctx => {
			const body = ctx.request.body

			// No ID = ask the API to create a new, empty flow
			if (!body.id) {
				const flow = await DbUsinFlow.create({
					name: 'Empty poll'
				})

				ctx.body = {
					data: flow
				}
				return
			}

			const flow = await DbUsinFlow.findOne({
				where: {
					id: body.id
				}
			})

			if (!flow) throw new APIError('Could not find flow')

			let keys = [
				'name',
				'description',
				'blocks',
				'archived',
				'autoSendHours',
				'autoSendCount',
				'autoSendAudience'
			]
			for (let key of keys) {
				if (body[key] !== undefined) {
					flow[key] = body[key]
				}
			}

			await flow.save()

			if (body.autoSendEnabled) {
				await flow.autoSendPlan()
			} else {
				flow.autoSendNext = null
				await flow.save()
			}

			ctx.body = {
				data: flow
			}
		}
	)

	server.router.post(
		'/api/admin/flows/send',
		NeedsPermissionMiddleware('EDIT_POLLS'),
		async ctx => {
			const body = ctx.request.body

			if (!body.id) throw new APIError('Poll not found')

			const flow = await DbUsinFlow.findByPk(body.id)

			if (!flow) throw new APIError('Poll not found')
			if (flow.archived) throw new APIError('Cannot send an archived poll')
			if (flow.system) throw new APIError('Cannot send a system poll')

			const requestsSent = await dispatchFlow(flow, body.filter)

			ctx.body = {
				data: {
					requestsSent
				}
			}
		}
	)

	server.router.get(
		'/api/admin/flows/:id/responses',
		NeedsPermissionMiddleware('VIEW_POLLS'),
		async ctx => {
			const flow = await DbUsinFlow.findByPk(ctx.params.id, {
				include: [DbUsinEntry]
			})

			if (!flow) throw new APIError('Poll not found')

			const ongoingCount = await DbUsinOngoingEntry.count({
				where: {
					flowId: flow.id
				}
			})

			ctx.body = {
				data: {
					ongoingCount,
					entries: flow.entries
				}
			}
		}
	)
}
