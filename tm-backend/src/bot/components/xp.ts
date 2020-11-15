import { bot } from '../bot'
import { DbLevellingUserLevel } from '../../common/db/models/levelling-user-level'
import { DbLevellingChannelSettings } from '../../common/db/models/levelling-channel-settings'
import { DbLevellingRanks } from '../../common/db/models/levelling-rank'
import { Op } from 'sequelize'
import moment from 'moment'
import { Message } from 'discord.js'

// XP Delimiters to reach a certain level. Array index is the level.
export const levelDelimiters = [0].concat(
	new Array(100)
		.fill(0)
		.map((_, lvl) => 5 * Math.pow(lvl, 2) + 50 * lvl + 100)
		.map(
			(v, i, arr) => v + arr.slice(0, i).reduce((curr, prev) => curr + prev, 0)
		)
)

export function levelFromXP(xp: number) {
	let i = 0
	while (i < levelDelimiters.length && levelDelimiters[i] <= xp) {
		i += 1
	}
	return i - 1
}

export function init() {
	bot.client.on('message', async msg => {
		if (msg.guild !== bot.getGuild()) return
		if (msg.author.bot) return

		const channelSettings = await DbLevellingChannelSettings.findOne({
			where: {
				discordChannelId: msg.channel.id
			}
		})

		const [userLevel] = await DbLevellingUserLevel.findOrBuild({
			where: {
				discordUserId: msg.author.id
			},
			defaults: {
				channelParticipations: []
			}
		})

		// Don't apply XP if the user has received XP within le last 15 seconds
		if (
			userLevel.updatedAt &&
			moment(userLevel.updatedAt) > moment().subtract(15, 'seconds')
		) {
			return
		}

		let xpMultiplier = 1

		if (!userLevel.channelParticipations.includes(msg.channel.id)) {
			userLevel.channelParticipations.push(msg.channel.id)
			userLevel.changed('channelParticipations', true)

			xpMultiplier = channelSettings?.initialMultiplier ?? xpMultiplier
		} else if (channelSettings) {
			xpMultiplier = channelSettings.multiplier
		}

		const xpDelta = Math.ceil(
			Math.sqrt(msg.content.length * 1.8 + 1) * 3 * xpMultiplier
		)
		userLevel.messageCount += 1
		userLevel.lastMessageAt = new Date()
		await userLevel.save()

		await changeUserXP(userLevel.discordUserId, xpDelta, msg)
	})
}

export async function changeUserXP(
	discordUserId: string,
	delta: number,
	message?: Message
) {
	const [userLevel] = await DbLevellingUserLevel.findOrBuild({
		where: {
			discordUserId
		},
		defaults: {
			channelParticipations: []
		}
	})

	// Make sure that the xp never goes below zero
	if (delta < 0 && -delta > userLevel.xp) delta = -userLevel.xp

	userLevel.xp += delta

	userLevel.xpAvailable += delta
	userLevel.lastMessageAt = new Date()
	if (userLevel.xpAvailable < 0) userLevel.xpAvailable = 0

	if (levelFromXP(userLevel.xp - delta) < levelFromXP(userLevel.xp)) {
		handleLevelUp(userLevel, userLevel.xp - delta, message)
	}

	if (userLevel.xp > userLevel.highestXp) userLevel.highestXp = userLevel.xp

	await userLevel.save()
}

async function handleLevelUp(
	userLevel: DbLevellingUserLevel,
	xpBackup: number,
	message?: Message
) {
	// Send level up message to user in DMs
	const member = bot.getGuild().member(userLevel.discordUserId)!

	if (message && message.channel) {
		await message.channel.send(
			`<@${member.id}> has reached level **${levelFromXP(userLevel.xp)}**!`
		)
	} else {
		await member.send(
			`You are now level **${levelFromXP(userLevel.xp)}** on Trademate!`
		)
	}

	const ranksGained = await DbLevellingRanks.findAll({
		where: {
			levelRequired: {
				[Op.lte]: levelFromXP(userLevel.xp)
			}
		}
	})

	if (ranksGained.length > 0) {
		const lastRank = ranksGained[ranksGained.length - 1]
		let hasGivenRole = false

		for (let roleId of lastRank.discordRoleRewardsIds) {
			if (!member.roles.cache.has(roleId)) {
				await member.roles.add(roleId).catch(console.error)
				hasGivenRole = true
			}
		}

		if (hasGivenRole) {
			await member.send(
				`You have now reached rank **${lastRank.name}** on Trademate!`
			)
		}

		// Remove previous roles if any
		for (let rank of ranksGained.slice(0, -1)) {
			for (let roleId of rank.discordRoleRewardsIds) {
				if (
					!lastRank.discordRoleRewardsIds.includes(roleId) &&
					member.roles.cache.has(roleId)
				) {
					await member.roles.remove(roleId).catch(console.error)
				}
			}
		}
	}
}

function randomIntFromInterval(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}
