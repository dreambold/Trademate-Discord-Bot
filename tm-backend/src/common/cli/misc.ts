import * as database from '../db/database'
import { bot } from '../../bot/bot'
import { getUmzug } from '../db/migration'
import { DbDiscordGuildMember } from '../db/models/discord-guild-member'
import { DbLevellingRanks } from '../db/models/levelling-rank'
import { DbLevellingUserLevel } from '../db/models/levelling-user-level'
import { levelFromXP } from '../../bot/components/xp'
import { DiscordAPIError, GuildMember } from 'discord.js'

export async function syncMembers() {
	// Load & update database
	await database.load()

	// Check for pending migrations
	let pending = await getUmzug().pending()
	if (pending.length > 0) console.warn('WARN: There are pending migrations')

	// Await the bot to connect, as we need its info
	await bot.run()

	console.log('Syncing Discord members...')

	for (let guild of bot.client.guilds.cache.values()) {
		process.stdout.write(`  - Syncing guild "${guild.name}" (${guild.id})... `)

		// This fetches all members
		await guild.members.fetch()

		process.stdout.write('+')

		for (let member of guild.members.cache.values()) {
			let [dbMember] = await DbDiscordGuildMember.findOrBuild({
				where: {
					discordGuildId: guild.id,
					discordUserId: member.id
				}
			})

			dbMember.updateFromMember(member)

			await dbMember.save()
		}

		process.stdout.write('+\n')
	}

	console.log('\nDone.')
	process.exit(0)
}

export async function syncLevels() {
	let ranksAddedCount = 0
	let ranksRemovedCount = 0

	// Load & update database
	await database.load()

	// Check for pending migrations
	const pending = await getUmzug().pending()
	if (pending.length > 0) console.warn('WARN: There are pending migrations')

	// Await the bot to connect, as we need its info
	await bot.run()

	console.log('Syncing Discord level roles...')

	const ranks = await DbLevellingRanks.findAll({
		order: [['levelRequired', 'ASC']]
	})
	const userLevels = await DbLevellingUserLevel.findAll({
		include: [DbDiscordGuildMember]
	})

	for (let userLevel of userLevels) {
		const userRanks = ranks.filter(
			rank => rank.levelRequired <= levelFromXP(userLevel.xp)
		)

		if (userRanks.length === 0) continue

		const lastRank = userRanks[userRanks.length - 1]

		let member: GuildMember
		try {
			member = await bot.getGuild().members.fetch(userLevel.discordUserId)
		} catch (e) {
			if (e instanceof DiscordAPIError) continue
			else throw e
		}

		// Add roles for the last rank
		for (let roleId of lastRank.discordRoleRewardsIds) {
			if (!member.roles.cache.has(roleId)) {
				await member.roles.add(roleId).catch(console.error)
				ranksAddedCount += 1
			}
		}

		// Remove previous roles if any
		for (let rank of userRanks.slice(0, -1)) {
			for (let roleId of rank.discordRoleRewardsIds) {
				if (
					!lastRank.discordRoleRewardsIds.includes(roleId) &&
					member.roles.cache.has(roleId)
				) {
					await member.roles.remove(roleId).catch(console.error)
					ranksRemovedCount += 1
				}
			}
		}
	}

	console.log(
		`Ranks added: ${ranksAddedCount}\nRanks removed: ${ranksRemovedCount}`
	)
	console.log('Done.')
	process.exit(0)
}
