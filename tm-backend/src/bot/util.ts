import { bot } from './bot'
import { Role, GuildMember, Channel } from 'discord.js'

export async function extractIdentifier(
	arg: string
): Promise<{
	id: string
	role?: Role
	channel?: Channel
	member?: GuildMember
} | null> {
	const re = /^<?@?&?!?#?([0-9]+)>?$/
	let match = (arg || '').trim().match(re)

	if (!match) return null

	const id = match[1]

	let res: any

	// The ID does not always include information about it being a role
	// (the "&"). Instead, if it is one then we return it as a role, if
	// not, we try to fetch the ID as a member ID.
	//
	// To be clear, Discord always tells us when it is a role (the "&"),
	// but elsewhere in this program we do not make the difference.
	// IDs are unique anyway, no matter the resource they refer to.
	let role = bot.getGuild().roles.cache.get(id)
	let channel = bot.getGuild().channels.cache.get(id)

	if (role) {
		res = {
			id,
			role
		}
	} else if (channel) {
		res = {
			id,
			channel
		}
	} else {
		try {
			res = {
				id,
				member:
					bot.getGuild().members.cache.get(id) ||
					(await bot.getGuild().members.fetch(id))
			}
		} catch (e) {
			return null
		}
	}

	if (!res.member && !res.role && !res.channel) return null

	return res
}

export function discordSafeString(str: string) {
	return str.replace('@everyone', '@\\everyone').replace('@here', '@\\here')
}

export function stripWords(str: string, n: number) {
	let curr = 0
	let found = 0

	for (let char of str) {
		if (char === ' ') found++

		if (found === n) {
			return str.slice(curr).trim()
		}

		curr++
	}

	return ''
}
