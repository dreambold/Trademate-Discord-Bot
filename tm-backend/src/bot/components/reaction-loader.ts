import { TextChannel, Emoji, MessageReaction } from 'discord.js'
import { bot } from '../bot'

/**
 * This listener will listen for Discord reactions events that do not have a
 * cached message yet. DiscordJS does not create messageReactionAdd/Remove
 * events for these so we need to do it ourselves.
 *
 * If not done, the bot will be unable to receive events from messages it does
 * not have in cache. (the cache is internal to DiscordJS)
 */
export function init() {
	// const events = {
	// 	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	// 	MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
	// }
	// const client = bot.client
	//
	// client.on('raw', async event => {
	// 	if (!events.hasOwnProperty(event.t)) return
	// 	const { d: data } = event
	// 	const user = client.users.get(data.user_id)
	// 	const channel = (client.channels.get(data.channel_id) ||
	// 		(await user!.createDM())) as TextChannel
	//
	// 	if (channel.messages.has(data.message_id)) return
	//
	// 	const message = await channel.fetchMessage(data.message_id)
	// 	const emojiKey = data.emoji.id
	// 		? `${data.emoji.name}:${data.emoji.id}`
	// 		: data.emoji.name
	// 	let reaction = message.reactions.get(emojiKey)
	//
	// 	if (!reaction) {
	// 		const emoji = new Emoji(client.guilds.get(data.guild_id)!, data.emoji)
	// 		reaction = new MessageReaction(
	// 			message,
	// 			emoji,
	// 			1,
	// 			data.user_id === client.user.id
	// 		)
	// 	}
	//
	// 	client.emit(events[event.t], reaction, user)
	// })
}
