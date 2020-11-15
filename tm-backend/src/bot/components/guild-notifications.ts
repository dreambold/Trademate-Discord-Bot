import { MessageEmbed, TextChannel } from 'discord.js'
import { bot } from '../bot'

export function init() {}

const types = {
	join: process.env.JOIN_MESSAGE_CHANNEL_ID.split(','),
	upgrade: process.env.UPGRADE_MESSAGE_CHANNEL_ID.split(','),
	trial: process.env.TRIAL_MESSAGE_CHANNEL_ID.split(',')
}

export async function SendGuildNotification(
	typeOrChannels: keyof typeof types | string[],
	message: string | MessageEmbed | { embed: any }
) {
	const channelIds = Array.isArray(typeOrChannels)
		? typeOrChannels
		: types[typeOrChannels]

	const channels = channelIds
		.map(id => bot.getGuild().channels.cache.get(id))
		.filter(v => !!v) as TextChannel[]

	await Promise.all(channels.map(c => c.send(message)))
}
