import { server } from '../../../server'
import { DbUser } from '../../../../common/db/models/user'
import { DbSubscription } from '../../../../common/db/models/subscription'
import { bot } from '../../../../bot/bot'
import { getActivePlans } from '../../../utils/stripe'
import { checkStripeSubscriptions } from '../../../components/update-stripe'
import { APIError } from '../../../utils/misc'
import { DbDiscordAccount } from '../../../../common/db/models/discord-account'
import { syncMembers } from '../../../../bot/components/sync-membership'
import { NeedsPermissionMiddleware } from '../../../middleware/misc'

export function init() {
	server.router.get(
		'/api/admin/members',
		NeedsPermissionMiddleware('VIEW_USERS'),
		async ctx => {
			if (ctx.request.query.sync === '1') {
				await checkStripeSubscriptions()
				ctx.body = {}
				return
			}

			const rawMembers = await DbUser.findAll({
				include: [DbSubscription, DbDiscordAccount]
			})

			// Fetch plans
			const rawPlans = await getActivePlans(true)
			const plans = rawPlans.map(plan => {
				return {
					id: plan.id,
					name: plan.nickname,
					amount: plan.amount,
					interval:
						plan.interval === 'year'
							? 12 * plan.interval_count
							: plan.interval_count
				}
			})

			const members = rawMembers.map(member => {
				const discordMember = bot.client.users.cache.get(
					member.discordAccount && member.discordAccount.discordUserId
				)

				let d: any = {
					id: member.id,
					name: member.name,
					email: member.email,
					rank: member.rank,
					permissions: member.permissions,
					discord: {
						id: member.discordAccount && member.discordAccount.discordUserId,
						tag: discordMember && discordMember.tag
					}
				}

				if (
					member.subscription &&
					['active', 'trialing'].includes(member.subscription.status)
				) {
					d.plan = plans.find(
						plan =>
							plan.id === (member.subscription && member.subscription.planId)
					)
					d.subscribedOn = member.subscription.createdAt
				}

				return d
			})

			ctx.body = {
				data: {
					members,
					count: members.length
				}
			}
		}
	)

	server.router.post(
		'/api/admin/members',
		NeedsPermissionMiddleware('EDIT_USERS'),
		async ctx => {
			const user = ctx.state.user as DbUser
			const body = ctx.request.body

			const targetUser = body.id
				? await DbUser.findByPk(body.id)
				: DbUser.build({})

			if (!targetUser) throw new APIError('User not found.')

			targetUser.set({
				name: body.name || targetUser.name,
				email: body.email || targetUser.email,
				permissions:
					(user.permissions.includes('ADMINISTRATOR') || user.rank > 0) &&
					(body.permissions ?? null) !== null
						? body.permissions
						: targetUser.permissions
			})

			await targetUser.validate()

			if (targetUser.isNewRecord) {
				if (await DbUser.findOne({ where: { email: body.email } })) {
					throw new APIError('Email address already in use.')
				}
			}

			await targetUser.save()

			if (body.discordId) {
				const discordMember = await bot.client.users
					.fetch(body.discordId)
					.catch(e => null)

				if (!discordMember) throw new APIError('Discord member not found')

				let discordAccount = await targetUser.$get('discordAccount')

				if (!discordAccount) {
					discordAccount = DbDiscordAccount.build({})
				}

				// Update the instance
				discordAccount.set({
					userId: targetUser.id,
					username: discordMember!.username,
					discriminator: discordMember!.discriminator,
					avatarURI: discordMember!.displayAvatarURL(),
					discordUserId: discordMember!.id
				})

				await discordAccount.save()
				await discordAccount.$set('user', targetUser)
			}

			syncMembers().catch(console.error)

			ctx.body = {
				data: {
					user: targetUser.toJSON()
				}
			}
		}
	)
}
