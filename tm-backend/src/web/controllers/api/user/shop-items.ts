import { server } from '../../../server'
import { DbShopItem } from '../../../../common/db/models/shop-item'
import { DbShopOrder } from '../../../../common/db/models/shop-order'
import { DbUser } from '../../../../common/db/models/user'
import { DbDiscordGuildMember } from '../../../../common/db/models/discord-guild-member'
import { APIError } from '../../../utils/misc'
import { DbLevellingUserLevel } from '../../../../common/db/models/levelling-user-level'
import { DbDiscordAccount } from '../../../../common/db/models/discord-account'
import { bot } from '../../../../bot/bot'
import { extendSubscription } from '../../../components/billing'

export function init() {
	server.router.get('/api/user/shop/items', async ctx => {
		const user = ctx.state.user as DbUser
		const discordAccount = await user.$get('discordAccount')
		const dbGuildMember =
			discordAccount &&
			(await DbDiscordGuildMember.findOne({
				where: {
					discordUserId: discordAccount.discordUserId
				}
			}))

		const items = await DbShopItem.findAll({
			order: [['price', 'ASC']],
			where: {
				archived: false
			}
		})

		const exportedItems = await Promise.all(
			items.map(async item => {
				const eItem = item.toJSON() as any

				// Check that the user hasn't already ordered those roles once before
				if (item.type === 'discord-roles') {
					eItem.availability =
						dbGuildMember &&
						!(item.data.roles as string[]).every(r =>
							dbGuildMember.discordRoleIds.includes(r)
						)
				} else {
					eItem.availability = true
				}

				return eItem
			})
		)

		ctx.body = {
			data: {
				items: exportedItems
			}
		}
	})

	server.router.post('/api/user/shop/order', async ctx => {
		const user = ctx.state.user as DbUser
		const item = await DbShopItem.findByPk(ctx.request.body.itemId)

		if (!item) throw new APIError('Shop item does not exist')

		const discordAccount = await user.$get('discordAccount')
		const userLevel =
			discordAccount &&
			(await DbLevellingUserLevel.findOne({
				where: {
					discordUserId: discordAccount.discordUserId
				}
			}))

		if (!userLevel || userLevel.xpAvailable < item.price)
			throw new APIError(
				'You do not have the required XP to purchase this item.'
			)

		userLevel.xpAvailable -= item.price
		await userLevel.save()

		const order = await DbShopOrder.create({
			itemId: item.id,
			userId: user.id
		})

		await fulfillOrder(order).catch(console.error)

		ctx.body = {
			data: {}
		}
	})

	server.router.get('/api/user/shop/order-history', async ctx => {
		const orders = await DbShopOrder.findAll({
			order: [['createdAt', 'DESC']],
			where: {
				userId: (ctx.state.user as DbUser).id
			},
			include: [DbShopItem],
			limit: 10
		})

		ctx.body = {
			data: {
				orders
			}
		}
	})
}

async function fulfillOrder(order: DbShopOrder) {
	const item = await order.$get('item')
	const user = await DbUser.findByPk(order.userId, {
		include: [DbDiscordAccount]
	})

	if (!user) return

	if (item?.type === 'discord-roles') {
		const member = await bot
			.getGuild()
			.members.fetch(user.discordAccount.discordUserId)

		if (!member) return

		for (let roleId of item.data.roles) {
			await member.roles.add(roleId).catch(console.error)
		}

		order.fulfilledAt = new Date()
		await order.save()
	} else if (item?.type === 'membership-extension') {
		const subscription = await user.$get('subscription')

		if (subscription)
			await extendSubscription(subscription, item.data.length * 30)

		order.fulfilledAt = new Date()
		await order.save()
	}
}
