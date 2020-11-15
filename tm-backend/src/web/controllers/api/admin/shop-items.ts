import { server } from '../../../server'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'
import { DbShopItem } from '../../../../common/db/models/shop-item'
import { APIError } from '../../../utils/misc'

export function init() {
	server.router.get(
		'/api/admin/shop/items',
		NeedsPermissionMiddleware('VIEW_SHOP'),
		async ctx => {
			const items = await DbShopItem.findAll({
				order: [['createdAt', 'DESC']]
			})

			ctx.body = {
				data: {
					items
				}
			}
		}
	)

	server.router.post(
		'/api/admin/shop/items',
		NeedsPermissionMiddleware('EDIT_SHOP'),
		async ctx => {
			const rawItem = ctx.request.body

			let item = rawItem.id
				? await DbShopItem.findByPk(rawItem.id)
				: DbShopItem.build()

			if (!item) throw new APIError('Shop item not found.')

			item.name = rawItem.name
			item.description = rawItem.description
			item.archived = rawItem.archived

			if (item.isNewRecord) {
				item.price = rawItem.price
				item.type = rawItem.type
				item.data = rawItem.data
			}

			await item.save()

			ctx.body = {
				data: {
					item
				}
			}
		}
	)
}
