import { bot } from '../bot'
import { GuildMember, PartialGuildMember } from 'discord.js'
import { DbDiscordGuildMember } from '../../common/db/models/discord-guild-member'

const syncingMembers = {}

export function init() {
	bot.client.on('guildMemberAdd', member => syncMember(member))
	bot.client.on('guildMemberAvailable', member => syncMember(member))
	bot.client.on('guildMemberRemove', member => syncMember(member, true))
	bot.client.on('guildMemberUpdate', (_, member) => syncMember(member))
	bot.client.on('guildMembersChunk', members =>
		members.mapValues(m => syncMember(m))
	)
}

async function syncMember(
	member: GuildMember | PartialGuildMember,
	leave = false
) {
	// This is to prevent two events in quick succession from ending up
	// inserting a guild profile twice
	if (syncingMembers[member.id]) return
	syncingMembers[member.id] = true

	try {
		if (member.partial) await member.fetch()

		let [dbMember] = await DbDiscordGuildMember.findOrBuild({
			where: {
				discordGuildId: member.guild.id,
				discordUserId: member.id
			}
		})

		dbMember.updateFromMember(member as GuildMember)
		dbMember.active = !leave

		await dbMember.save()
	} catch (e) {}

	delete syncingMembers[member.id]
}
