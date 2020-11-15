import { server } from '../../server'
import { APIError } from '../../utils/misc'
import { bot } from '../../../bot/bot'
import { DbTrial } from '../../../common/db/models/trial'
import moment from 'moment'
import { TextChannel } from 'discord.js'
import { statistics } from '../../components/statistics'
import {
	DbCohortEvent,
	CohortEventType
} from '../../../common/db/models/cohort-event'
import { createTrialFlows } from '../../../bot/components/sync-trials'
import { getMessageTemplateReady } from '../../../common/db/models/message-template'
import { Mailchimp } from '../../components/mailchimp'

export function init() {
	server.router.get('/api/trial-info', async ctx => {
		return

		if (!ctx.query.userId) {
			throw new APIError('Invalid user ID provided')
		}

		const member = await bot.getGuild().members.fetch(ctx.query.userId)

		if (!member) {
			throw new APIError('Invalid user ID provided')
		}

		const dbTrial = await DbTrial.findOne({
			where: {
				discordUserId: member.id
			}
		})

		ctx.body = {
			status: 200,
			data: {
				trial: dbTrial,
				user: {
					id: member.id,
					username: member.user.username,
					discriminator: member.user.discriminator,
					avatarURI: member.user.displayAvatarURL
				}
			}
		}
	})

	server.router.post('/api/trial-info', async ctx => {
		return

		if (!ctx.query.userId) {
			throw new APIError('Invalid user ID provided')
		}

		const member = await bot.getGuild().members.fetch(ctx.query.userId)

		if (!member) {
			throw new APIError('Invalid user ID provided')
		}

		let dbTrial = await DbTrial.findOne({
			where: {
				discordUserId: member.id
			}
		})

		if (!dbTrial) {
			dbTrial = await DbTrial.create({
				discordUserId: member.id,
				endsAt: moment()
					.add(7, 'days')
					.toISOString()
			})

			const announceChannels = process.env.TRIAL_MESSAGE_CHANNEL_ID.split(',')
				.map(c => bot.client.channels.cache.get(c) as TextChannel)
				.filter(c => !!c)

			await member.roles.add(process.env.TRIAL_ROLE_ID)
			statistics.trialStart.inc(1)
			await DbCohortEvent.createEvent(CohortEventType.TRIAL_STARTED, member.id)
			await createTrialFlows(member)

			for (let announceChannel of announceChannels) {
				await announceChannel.send(
					await getMessageTemplateReady('trialStartedMessage', {
						mention: `${member}`
					})
				)
			}

			if (ctx.query.email) {
				Mailchimp.subscribeToNewsletter({
					email: ctx.query.email,
					firstName: member.user.username + '#' + member.user.discriminator,
					lastName: ''
				})
					.then(() => {
						Mailchimp.updateEmailTags(ctx.query.email, ['trial'])
					})
					.catch(console.error)
			}
		}

		ctx.body = {
			status: 200,
			data: {
				trial: dbTrial,
				user: {
					id: member.id,
					username: member.user.username,
					discriminator: member.user.discriminator,
					avatarURI: member.user.displayAvatarURL
				}
			}
		}
	})
}
