import { server } from '../../../server'
import {
	DbMessageTemplate,
	defaultTemplates
} from '../../../../common/db/models/message-template'
import { APIError } from '../../../utils/misc'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/templates',
		NeedsPermissionMiddleware('VIEW_MESSAGES'),
		async ctx => {
			const dbTemplates = await DbMessageTemplate.findAll()
			const templates = {}

			for (let [tplName, tplInfo] of Object.entries(defaultTemplates)) {
				templates[tplName] = {
					...tplInfo,

					template: (dbTemplates.find(tpl => tpl.slug === tplName) || tplInfo)
						.template
				}
			}

			ctx.body = {
				data: {
					templates
				}
			}
		}
	)

	server.router.post(
		'/api/admin/templates',
		NeedsPermissionMiddleware('EDIT_MESSAGES'),
		async ctx => {
			const body = ctx.request.body

			if (!body.slug || !defaultTemplates[body.slug])
				throw new APIError('Could not find template')

			const [template] = await DbMessageTemplate.findOrBuild({
				where: {
					slug: body.slug
				}
			})

			template.template = body.template
			await template.save()

			ctx.body = {
				data: {}
			}
		}
	)
}
