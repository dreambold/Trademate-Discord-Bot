import { DbUsinFlow } from '../../common/db/models/usin-flow'
import { bot } from '../bot'
import { GuildMember } from 'discord.js'
import { DbUsinOngoingEntry } from '../../common/db/models/usin-ongoing-entry'
import { EventEmitter } from 'events'
import { DbUsinEntry } from '../../common/db/models/usin-entry'
import { sendBlockMessage } from './usin-sender'
import { DbDiscordGuildMember } from '../../common/db/models/discord-guild-member'
import { getJsonConfig } from '../../common/config'

export function init() {}

export const usinBus = new EventEmitter()

/**
 * Creates a DbUsinOngoingFlow entry for each member that should receive the
 * flow
 */
export async function dispatchFlow(
	flow: DbUsinFlow,
	filter: 'all' | 'members' | 'non-members' | 'trials' | { userID: string }
) {
	if (flow.blocks.length === 0) return

	let members: GuildMember[] = []

	if (typeof filter === 'object') {
		members = [await bot.getGuild().members.fetch(filter.userID)]
	} else {
		const cachedMembers = await DbDiscordGuildMember.findAll()

		const toSendCachedMembers = cachedMembers.filter(
			m => applyMemberFilter(m.discordRoleIds, filter) && !m.bot
		)

		for (let cachedMember of toSendCachedMembers) {
			await bot
				.getGuild()
				.members.fetch(cachedMember.discordUserId)
				.then(m => members.push(m))
				.catch(console.error)
		}
	}

	await DbUsinOngoingEntry.bulkCreate(
		members.map(member => {
			return {
				flowId: flow.id,
				blocks: flow.blocks,
				discordUserId: member.id,
				currentStep: 0
			}
		})
	)

	return members.length
}

export function applyMemberFilter(
	memberOrRoles: GuildMember | string[],
	filter: string
) {
	const possibleMemberRoleIds = getJsonConfig().products.map(
		p => p.discordRoleId
	)
	const roles = Array.isArray(memberOrRoles)
		? memberOrRoles
		: memberOrRoles.roles.cache.map(r => r.id)

	if (filter === 'all') return true
	else if (filter === 'members')
		return possibleMemberRoleIds.some(r => roles.includes(r))
	else if (filter === 'non-members')
		return !possibleMemberRoleIds.some(r => roles.includes(r))
	else if (filter === 'trials') return roles.includes(process.env.TRIAL_ROLE_ID)

	return false
}

export async function checkNextStep(flow: DbUsinOngoingEntry) {
	flow.currentStep += 1

	if (flow.currentStep >= flow.blocks.length) {
		await flow.destroy()

		let user = await bot.client.users.fetch(flow.discordUserId)

		await DbUsinEntry.create({
			blocks: flow.blocks,
			discordUserId: flow.discordUserId,
			discordUserTag: (user && user.tag) || '',
			flowId: flow.flowId
		})
	} else {
		await flow.save()
		await sendBlockMessage(flow)

		if (flow.blocks[flow.currentStep].promptType === 'none') {
			await checkNextStep(flow)
		}
	}
}
