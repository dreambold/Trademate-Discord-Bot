import { server } from '../../../server'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'
import { DbShopOrder } from '../../../../common/db/models/shop-order'
import { DbShopItem } from '../../../../common/db/models/shop-item'
import { DbUser } from '../../../../common/db/models/user'
import { APIError } from '../../../utils/misc'

export function init() {
	server.router.get(
		'/api/admin/shop/orders',
		NeedsPermissionMiddleware('VIEW_SHOP'),
		async ctx => {
			const orders = await DbShopOrder.findAll({
				order: [['createdAt', 'DESC']],
				include: [DbShopItem, DbUser]
			})

			ctx.body = {
				data: {
					orders
				}
			}
		}
	)

	server.router.post(
		'/api/admin/shop/orders',
		NeedsPermissionMiddleware('EDIT_SHOP'),
		async ctx => {
			const rawOrder = ctx.request.body
			const order = await DbShopOrder.findByPk(rawOrder.id)

			if (!order) throw new APIError('Could not find order')

			// Only the 'fulfilledAt' attribute can be edited
			order.fulfilledAt = rawOrder.fulfilledAt
			await order.save()

			ctx.body = {
				data: {
					order
				}
			}
		}
	)
}
