import { bot } from '../bot'
import { DbTrial } from '../../common/db/models/trial'
import moment from 'moment'
import { statistics } from '../../web/components/statistics'
import {
	DbCohortEvent,
	CohortEventType
} from '../../common/db/models/cohort-event'
import { GuildMember, TextChannel } from 'discord.js'
import { DbUsinOngoingEntry } from '../../common/db/models/usin-ongoing-entry'
import { DbUsinFlow } from '../../common/db/models/usin-flow'
import { DbUsinEntry } from '../../common/db/models/usin-entry'
import { getMessageTemplateReady } from '../../common/db/models/message-template'
import { DbDiscordGuildMember } from '../../common/db/models/discord-guild-member'
import { Op } from 'sequelize'
import { SendGuildNotification } from './guild-notifications'

export function init() {
	if (!process.env.TRIAL_ROLE_ID) return

	setInterval(() => checkTrials().catch(console.error), 5 * 60 * 1000)
	setTimeout(() => checkTrials().catch(console.error), 20 * 1000)
}

/**
 * Check which members to add/remove the trial role to/from. Also does the
 * adding/removing part.
 */
export async function checkTrials() {
	const memberDiscordAccounts = await DbDiscordGuildMember.findAll({
		where: {
			discordRoleIds: {
				[Op.contains]: [process.env.TRIAL_ROLE_ID]
			}
		}
	})

	const trials = await DbTrial.findAll()

	const hasTrial = (discordUserId: string) =>
		!!trials.find(
			t => t.discordUserId === discordUserId && t.endsAt > new Date()
		)

	const trialsToAdd = trials.filter(
		t =>
			t.endsAt > new Date() &&
			!memberDiscordAccounts.find(m => m.discordUserId === t.discordUserId)
	)

	for (let trial of trialsToAdd) {
		const member = await bot.getGuild().members.fetch(trial.discordUserId)
		statistics.trialStart.inc(1)
		bot.logger.info(
			{ memberId: member.id },
			'Adding trial to ' + member.user.tag
		)
		await member.roles.add(process.env.TRIAL_ROLE_ID)
		await createTrialFlows(member)

		await DbCohortEvent.createEvent(CohortEventType.TRIAL_STARTED, member.id)

		await SendGuildNotification(
			'trial',
			await getMessageTemplateReady('trialStartedMessage', {
				mention: `<@${member.id}>`
			})
		)
	}

	const membersToRemove = memberDiscordAccounts.filter(
		m => !hasTrial(m.discordUserId)
	)

	for (let member of membersToRemove) {
		if (member.discordUserId !== '111473417932242944') {
			const discordMember = await bot
				.getGuild()
				.members.fetch(member.discordUserId)

			statistics.trialEnd.inc(1)

			bot.logger.info(
				{ memberId: discordMember.id },
				'Removing trial from ' + discordMember.user.tag
			)

			await discordMember.roles.remove(process.env.TRIAL_ROLE_ID)

			if (
				process.env.OLD_TRIAL_ROLE_ID &&
				!discordMember.roles.cache.has(process.env.OLD_TRIAL_ROLE_ID)
			) {
				await discordMember.roles.add(process.env.OLD_TRIAL_ROLE_ID)
			}
		}
	}

	// Get myself (the dev) as I have an "eternal trial"
	const member = await bot.getGuild().members.fetch('111473417932242944')
	if (!member.roles.cache.has(process.env.TRIAL_ROLE_ID))
		await member.roles.add(process.env.TRIAL_ROLE_ID)
}

export async function createTrialFlows(member: GuildMember) {
	const flowNames = [
		'TrialDay1',
		'TrialDay2',
		'TrialDay3',
		'TrialDay4',
		'TrialDay5',
		'TrialDay6',
		'TrialDay7'
	]

	const flows = await Promise.all(
		flowNames.map(name =>
			DbUsinFlow.findOne({
				where: {
					name
				}
			})
		)
	)

	if (flows.length === 0 || !flows[0]?.id) return

	// Check that the user hasn't received the trial flows already once
	let hasOldTrialFlow = !!(await DbUsinOngoingEntry.findOne({
		where: {
			flowId: flows[0]?.id,
			discordUserId: member.id
		}
	}))
	if (hasOldTrialFlow) return

	hasOldTrialFlow = !!(await DbUsinEntry.findOne({
		where: {
			flowId: flows[0]?.id,
			discordUserId: member.id
		}
	}))
	if (hasOldTrialFlow) return

	// Create the flows
	for (let [i, flow] of flows.entries()) {
		if (!flow) continue

		await DbUsinOngoingEntry.create({
			flowId: flow.id,
			blocks: flow.blocks,
			discordUserId: member.id,
			plannedAt: moment()
				.add(i, 'days')
				.toISOString()
		})
	}
}
