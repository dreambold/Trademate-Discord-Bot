import { bot } from '../bot'
import { DbUsinOngoingEntry } from '../../common/db/models/usin-ongoing-entry'
import { Op } from 'sequelize'
import { Message, MessageReaction, User } from 'discord.js'
import { checkNextStep } from './usin'

/**
 * File that handles receiving events for the USIN system
 */
export function init() {
	bot.client.on('message', message =>
		handleReceivedMessage(message).catch(console.error)
	)

	bot.client.on('messageReactionAdd', async (reaction, user) => {
		if (user.partial) await user.fetch()
		if (reaction.partial) await reaction.fetch()

		await handleReceivedReaction(reaction, user as User).catch(console.error)
	})
}

async function getOngoingUserFlow(discordUserId: string) {
	return DbUsinOngoingEntry.findOne({
		where: {
			discordUserId,
			lastMessageId: {
				[Op.ne]: null
			}
		}
	})
}

async function handleReceivedMessage(message: Message) {
	if (message.channel !== message.author.dmChannel) return

	const flow = await getOngoingUserFlow(message.author.id)

	if (
		!flow ||
		!['text', 'rating'].includes(flow.blocks[flow.currentStep].promptType)
	)
		return

	if (flow.blocks[flow.currentStep].promptType === 'rating') {
		let i = parseInt(message.content)
		if (isNaN(i) || i < 0 || i > 5)
			return message.reply('Please provide a valid rating between 0 and 5.')
	}

	flow.blocks[flow.currentStep].promptAnswer = message.content
	flow.changed('blocks', true)
	await flow.save()

	await checkNextStep(flow)
}

async function handleReceivedReaction(reaction: MessageReaction, user: User) {
	const message = reaction.message
	if (message.channel !== user.dmChannel) return

	const flow = await getOngoingUserFlow(user.id)

	if (
		!flow ||
		flow.blocks[flow.currentStep].promptType !== 'choice' ||
		!flow.blocks[flow.currentStep].promptChoices!.includes(
			reaction.emoji.toString()
		)
	)
		return

	flow.blocks[flow.currentStep].promptAnswer = reaction.emoji.toString()
	flow.changed('blocks', true)
	await flow.save()

	await checkNextStep(flow)
}
