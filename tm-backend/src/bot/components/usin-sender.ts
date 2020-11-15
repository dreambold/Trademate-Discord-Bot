import { DbUsinOngoingEntry } from '../../common/db/models/usin-ongoing-entry'
import { UsinBlock, DbUsinFlow } from '../../common/db/models/usin-flow'
import { MessageEmbed, Message, User, GuildMember } from 'discord.js'
import { bot } from '../bot'
import { DbTrial } from '../../common/db/models/trial'
import { Op } from 'sequelize'
import { applyMemberFilter, dispatchFlow, checkNextStep } from './usin'
import { DbDiscordGuildMember } from '../../common/db/models/discord-guild-member'

/**
 * File that handles sending events for the USIN system.
 *
 * Every 10 seconds, the program will attempt to send out 10 flows that are in
 * the queue. The limit is there because of the Discord rate limit in sending
 * messages and reactions.
 */
export function init() {
	bot.logger.info('USIN Sender started')
	setInterval(() => {
		sendNewFlows().catch(console.error)
	}, 60 * 1000)

	setInterval(() => {
		checkAutoSendFlows().catch(console.error)
	}, 60 * 1000)
}

export function buildBlockMessage(block: UsinBlock, user: User) {
	if (block.type === 'embed') {
		return new MessageEmbed({
			title: (block.message.title || '').replace('{userId}', user.id),
			description: (block.message.description || '').replace(
				'{userId}',
				user.id
			),
			footer: {
				text: (block.message.text || '').replace('{userId}', user.id)
			}
		})
	} else {
		return ((block.message as string) || '').replace('{userId}', user.id)
	}
}

export async function sendBlockMessage(flow: DbUsinOngoingEntry) {
	let block = flow.blocks[flow.currentStep]
	if (!block) return

	let user = await bot.client.users.fetch(flow.discordUserId)
	let message = buildBlockMessage(block, user)

	if (user) {
		let msg: Message

		try {
			msg = await user.send(message)
		} catch (e) {
			// An error sending the message? Don't retry!
			// 50007 = when the target user has disabled DMs, apparently
			if (e.name === 'DiscordAPIError' && e.code === 50007) await flow.destroy()
			else console.log(e)

			return
		}

		flow.lastMessageId = msg.id
		await flow.save()

		if (block.promptType === 'choice') {
			for (let emoji of block.promptChoices!) {
				await msg.react(emoji)
			}
		}
	}
}

export async function fetchFlowLastMessage(flow: DbUsinOngoingEntry) {
	let user = await bot.client.users.fetch(flow.discordUserId)

	if (user && user.dmChannel) {
		return await user.dmChannel.messages.fetch(flow.lastMessageId)
	}
}

export async function cancelOngoingFlow(flow: DbUsinOngoingEntry) {
	if (flow.lastMessageId) {
		let user = await bot.client.users.fetch(flow.discordUserId)
		let message = await fetchFlowLastMessage(flow)

		if (message) {
			let content = buildBlockMessage(flow.blocks[flow.currentStep], user)

			if (typeof content === 'string') {
				content = content += ' [prompt canceled]'
			} else {
				content.setFooter(
					((content.footer && content.footer.text) || '') + ' [prompt canceled]'
				)
			}

			await message.edit(content)
		}
	}

	await flow.destroy()
}

export async function sendNewFlows(limit = 10) {
	let sendableEntries = await getNewSendableEntries()

	// We send a small number of entries periodically to make sure we don't hit
	// Discord rate limits
	sendableEntries = sendableEntries.slice(0, limit)

	for (let entry of sendableEntries) {
		const flow = await entry.entry.$get('flow')

		entry.entry.blocks = JSON.parse(JSON.stringify(flow?.blocks || []))

		if (!flow || entry.entry.blocks.length === 0) {
			await cancelOngoingFlow(entry.entry)
			continue
		}

		await entry.entry.save()

		if (entry.activeEntry) {
			await cancelOngoingFlow(entry.activeEntry)
		}

		// Check for trial flows. If it is a trial flow, and the trial was
		// revoked for some reason (idk), then don't send the message.
		if (flow?.name?.startsWith('TrialDay')) {
			const trial = await DbTrial.findOne({
				where: {
					discordUserId: entry.entry.discordUserId
				}
			})

			if (!trial || !trial.endsAt || trial.endsAt < new Date()) {
				await cancelOngoingFlow(entry.entry)
				return
			}
		}

		await sendBlockMessage(entry.entry)

		if (entry.entry.blocks[0].promptType === 'none') {
			await checkNextStep(entry.entry)
		}
	}
}

export async function getNewSendableEntries() {
	let cancelableAfterMS = 6 * 60 * 60 * 1000
	let ongoingEntries = await DbUsinOngoingEntry.findAll({
		where: {
			lastMessageId: null
		}
	})

	// Only get entries that don't have another currently ongoing flow,
	// or if that flow is old enough to be cancelled. (6 hours)
	return ongoingEntries
		.filter(entry => !entry.plannedAt || entry.plannedAt < new Date())
		.map(entry => {
			return {
				entry,
				activeEntry: ongoingEntries.find(
					e =>
						e.discordUserId === entry.discordUserId && e.lastMessageId !== null
				)
			}
		})
		.filter(data => {
			return (
				!data.activeEntry ||
				data.activeEntry.updatedAt < new Date(Date.now() - cancelableAfterMS)
			)
		})
}

async function checkAutoSendFlows() {
	const flows = await DbUsinFlow.findAll({
		where: {
			autoSendNext: {
				[Op.ne]: null,
				[Op.lte]: new Date().toISOString()
			}
		}
	})

	for (let flow of flows) {
		await sendAutoFlow(flow)
	}
}

async function sendAutoFlow(flow: DbUsinFlow) {
	if (!flow.autoSendCount || !flow.autoSendHours || !flow.autoSendAudience)
		return

	try {
		const members = await getRandomGuildMembersFromFilter(
			flow.autoSendCount,
			flow.autoSendAudience
		)

		for (let member of members) {
			await dispatchFlow(flow, { userID: member.id })
		}
	} catch (e) {
		console.error(e)
	}

	await flow.autoSendPlan()
}

async function getRandomGuildMembersFromFilter(n: number, filter: string) {
	const cachedMembers = await DbDiscordGuildMember.findAll()

	const members = cachedMembers.filter(v =>
		applyMemberFilter(v.discordRoleIds, filter)
	)

	let chosenMembers: DbDiscordGuildMember[] = []

	while (members.length > 0 && chosenMembers.length < n) {
		let index = Math.floor(Math.random() * members.length)
		chosenMembers.push(members.splice(index, 1)[0])
	}

	const discordMembers: GuildMember[] = []

	for (let m of chosenMembers) {
		await bot
			.getGuild()
			.members.fetch(m.discordUserId)
			.then(m => discordMembers.push(m))
			.catch(console.error)
	}

	return discordMembers
}
