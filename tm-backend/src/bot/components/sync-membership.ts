import { bot } from '../bot'
import { TextChannel, GuildMember } from 'discord.js'
import { DbUser } from '../../common/db/models/user'
import { DbSubscription } from '../../common/db/models/subscription'
import { DbDiscordAccount } from '../../common/db/models/discord-account'
import { getMessageTemplateReady } from '../../common/db/models/message-template'
import { DbUsinFlow } from '../../common/db/models/usin-flow'
import { dispatchFlow } from './usin'
import { DbUserLifetime, Lifetime } from '../../common/db/models/user-lifetime'
import { DbDiscordGuildMember } from '../../common/db/models/discord-guild-member'
import { Op } from 'sequelize'
import { SendGuildNotification } from './guild-notifications'
import { getJsonConfig, JsonConfigProduct } from '../../common/config'

export function init() {}

export async function syncMembers() {
	for (let product of getJsonConfig().products) {
		await syncMembersRole(product)
	}
}

/**
 * Check which members to add/remove the member role to/from. Also does the
 * adding/removing part.
 */
async function syncMembersRole(product: JsonConfigProduct) {
	bot.logger.info(`Syncing members for role ${product.discordRoleId}`)

	const subscriptions = await DbSubscription.findAll({
		where: {
			status: {
				[Op.in]: ['active', 'trialing']
			},
			planId: {
				[Op.in]: [...product.stripePlanIds, ...product.stripeLegacyPlanIds]
			}
		},
		include: [
			{
				required: true,
				model: DbUser,
				include: [
					{
						required: true,
						model: DbDiscordAccount
					}
				]
			}
		]
	})

	const memberDiscordAccounts = await DbDiscordGuildMember.findAll({
		where: {
			discordRoleIds: {
				[Op.overlap]: [product.discordRoleId]
			},
			active: true
		}
	})

	const membersToDelete = memberDiscordAccounts.filter(
		member =>
			!subscriptions.find(
				s => s.user.discordAccount.discordUserId === member.discordUserId
			)
	)

	for (let member of membersToDelete) {
		let discordMember: GuildMember

		bot.logger.info(
			`Removing premium role from ${member.username}#${member.discriminator} (${member.discordUserId})`
		)

		try {
			discordMember = await bot.getGuild().members.fetch(member.discordUserId)
		} catch (e) {
			bot.logger.warn({ err: e }, 'Failed discord member fetch')
			continue
		}

		await discordMember.roles.remove(product.discordRoleId).catch(console.error)

		await DbUserLifetime.endLifetime(Lifetime.PAID, member.id)
	}

	const usersToAdd = subscriptions
		.filter(
			s =>
				!memberDiscordAccounts.find(
					m => m.discordUserId === s.user.discordAccount.discordUserId
				)
		)
		.map(s => s.user)

	for (let user of usersToAdd) {
		// We check that the user is indeed in the server. If he isn't, we
		// prevent a 404 request to the Discord API trying to fetch them
		let discordMember = await DbDiscordGuildMember.findOne({
			where: {
				discordUserId: user.discordAccount.discordUserId,
				active: true
			}
		})
		if (!discordMember) continue

		bot.logger.info(
			`Adding premium role to ${discordMember.username}#${discordMember.discriminator} (${discordMember.discordUserId})`
		)

		let member: GuildMember

		try {
			member = await bot
				.getGuild()
				.members.fetch(user.discordAccount.discordUserId)
		} catch (e) {
			bot.logger.warn({ err: e }, 'Failed discord member fetch')
			continue
		}

		await member.roles.add(product.discordRoleId).catch(console.error)

		await DbUserLifetime.startLifetime(Lifetime.PAID, user.id)

		await SendGuildNotification(
			'upgrade',
			await getMessageTemplateReady('userUpgradedMessage', {
				mention: `<@${member.id}>`
			})
		).catch(console.error)

		const flow = await DbUsinFlow.findOne({
			where: { name: 'SubscribedDM' }
		})
		if (flow) {
			dispatchFlow(flow, { userID: member.id }).catch(console.error)
		}
	}
}
