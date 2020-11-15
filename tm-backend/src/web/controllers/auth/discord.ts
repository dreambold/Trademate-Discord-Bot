import { server } from '../../server'
import { DbUser } from '../../../common/db/models/user'
import { fetchTokenFromCode, fetchUser } from '../../utils/discord'
import { DbDiscordAccount } from '../../../common/db/models/discord-account'
import { syncMembers } from '../../../bot/components/sync-membership'
import { DbTrial } from '../../../common/db/models/trial'
import { statistics } from '../../components/statistics'
import {
	DbCohortEvent,
	CohortEventType
} from '../../../common/db/models/cohort-event'

export function init() {
	server.router.get('/auth/discord', async ctx => {
		const dbUser: DbUser = ctx.state.user

		if (!ctx.query.code) {
			// Redirect to the Discord login page
			return ctx.redirect(
				`https://discordapp.com/api/oauth2/authorize?client_id=${
					process.env.DISCORD_CLIENT_ID
				}&redirect_uri=${encodeURIComponent(
					`${process.env.API_BASE_URI}/auth/discord`
				)}&response_type=code&scope=identify%20email`
			)
		}

		try {
			// Fetch token
			let token = await fetchTokenFromCode(ctx.query.code)

			// Fetch profile of target user
			let user = await fetchUser('@me', token)

			let dbDiscordAccount = await DbDiscordAccount.findOne({
				where: {
					discordUserId: user.id
				},
				include: [DbUser]
			})

			// The user logs into an account linked to another user account, so we delete the old link
			if (
				dbUser &&
				dbDiscordAccount &&
				dbDiscordAccount.user &&
				dbDiscordAccount.user.id !== dbUser.id
			) {
				await dbDiscordAccount.destroy()
				dbDiscordAccount = null!
			}

			if (!dbDiscordAccount || !dbDiscordAccount.user) {
				if (dbUser) {
					dbDiscordAccount = DbDiscordAccount.build({
						userId: dbUser.id,
						discordUserId: user.id
					})
					dbDiscordAccount.user = dbUser

					// Check if the user was a conversion. If it is, increment
					// the counter. This is needed because we can't check for
					// conversion during purshase (as no account Discord is
					// connected yet)
					const trial = await DbTrial.findOne({
						where: {
							discordUserId: dbDiscordAccount.discordUserId
						}
					})

					if (trial) {
						trial.endsAt = new Date()
						trial.save().catch(console.error)

						statistics.trialConversion.inc(1)

						await DbCohortEvent.createEvent(
							CohortEventType.CONVERT_PREMIUM,
							dbDiscordAccount.discordUserId
						)
					}
				} else {
					return ctx.redirect(process.env.WEB_BASE_URI)
				}
			}

			dbDiscordAccount.username = user.username
			dbDiscordAccount.discriminator = user.discriminator

			if (user.avatar) {
				dbDiscordAccount.avatarURI = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
			} else {
				dbDiscordAccount.avatarURI = `https://cdn.discordapp.com/embed/avatars/${parseInt(
					user.discriminator
				) % 5}.png`
			}

			await dbDiscordAccount.save()

			// Create session
			;(ctx as any).session.userId = dbDiscordAccount.user.id

			syncMembers().catch(console.error)

			if (
				dbDiscordAccount.user.rank > 0 ||
				dbDiscordAccount.user.permissions.includes('VIEW_DASHBOARD')
			) {
				return ctx.redirect(process.env.WEB_BASE_URI + '/#/admin')
			}

			ctx.redirect(process.env.WEB_BASE_URI + '/#/account')
		} catch (e) {
			console.error(e)

			ctx.body = 'An unexpected error occured.'
		}
	})
}
