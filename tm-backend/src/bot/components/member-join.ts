import { bot } from '../bot'
import { TextChannel, GuildMember } from 'discord.js'
import { getMessageTemplateReady } from '../../common/db/models/message-template'
import { DbDiscordAccount } from '../../common/db/models/discord-account'
import { DbUser } from '../../common/db/models/user'
import { DbSubscription } from '../../common/db/models/subscription'
import { DbUsinFlow } from '../../common/db/models/usin-flow'
import { dispatchFlow } from './usin'
import { DbTrial } from '../../common/db/models/trial'
import moment from 'moment'
import { statistics } from '../../web/components/statistics'
import { DbUserLifetime, Lifetime } from '../../common/db/models/user-lifetime'
import {
	DbCohortEvent,
	CohortEventType
} from '../../common/db/models/cohort-event'
import { DbUsinOngoingEntry } from '../../common/db/models/usin-ongoing-entry'
import { SendGuildNotification } from './guild-notifications'

export function init() {
	bot.client.on('guildMemberAdd', async member => {
		statistics.memberJoin.inc(1)
		await Promise.all([
			DbUserLifetime.startLifetime(Lifetime.FREE, member.id),
			DbCohortEvent.createEvent(CohortEventType.JOIN, member.id)
		])

		await SendGuildNotification(
			'join',
			await getMessageTemplateReady('welcomeMessage', {
				mention: '' + member
			})
		)

		const flow = await DbUsinFlow.findOne({
			where: {
				name: 'JoinDM'
			}
		})
		if (flow) await dispatchFlow(flow, { userID: member.id })

		const csatFlow = await DbUsinFlow.findOne({
			where: {
				name: 'CSAT7Days'
			}
		})
		if (csatFlow)
			await DbUsinOngoingEntry.create({
				flowId: csatFlow.id,
				blocks: [],
				discordUserId: member.id,
				plannedAt: moment()
					.add(7, 'days')
					.toISOString()
			})

		setTimeout(
			() => sendMemberTrial(member as GuildMember).catch(console.error),
			10 * 1000
		)
	})

	bot.client.on('guildMemberRemove', member => {
		DbUserLifetime.endLifetime(Lifetime.FREE, member.id).catch(console.error)
		statistics.memberLeave.inc(1)
	})
}

export async function sendMemberTrial(member: GuildMember) {
	const discordAccount = await DbDiscordAccount.findOne({
		where: {
			discordUserId: member.id
		},
		include: [
			{
				model: DbUser,
				include: [DbSubscription]
			}
		]
	})

	const trial = await DbTrial.findOne({
		where: {
			discordUserId: member.id
		}
	})

	if (
		!trial &&
		!(discordAccount && discordAccount.user && discordAccount.user.subscription)
	) {
		const flow = await DbUsinFlow.findOne({
			where: {
				name: 'TrialMessage'
			}
		})
		if (flow) await dispatchFlow(flow, { userID: member.id })
	}
}
