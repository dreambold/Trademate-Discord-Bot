import client from 'prom-client'
import { server } from '../server'
import { bot } from '../../bot/bot'
import { DbTrial } from '../../common/db/models/trial'
import { Op } from 'sequelize'
import { VoiceChannel } from 'discord.js'

export const statistics = {
	memberJoin: new client.Counter({
		name: 'member_join',
		help: 'member_join'
	}),
	memberLeave: new client.Counter({
		name: 'member_leave',
		help: 'member_leave'
	}),
	members: new client.Gauge({
		name: 'members',
		help: 'members'
	}),
	trialStart: new client.Counter({
		name: 'trial_start',
		help: 'trail_start'
	}),
	trialEnd: new client.Counter({
		name: 'trial_end',
		help: 'trial_end'
	}),
	trialConversion: new client.Counter({
		name: 'client_conversion',
		help: 'client_conversion'
	}),
	trials: new client.Gauge({
		name: 'trials',
		help: 'trials'
	}),
	peopleInVoiceRooms: new client.Gauge({
		name: 'people_in_voice_rooms',
		help: 'people_in_voice_rooms'
	})
}

export function init() {
	setInterval(collect, 30 * 1000)
}

function collect() {
	Promise.all([
		collectMembersCount(),
		collectTrials(),
		collectPeopleInVoiceRooms()
	]).catch(err =>
		server.logger.error(
			{ component: 'statistics', err },
			'Error during interval stats collection'
		)
	)
}

async function collectMembersCount() {
	statistics.members.set(bot.getGuild().memberCount)
}

async function collectTrials() {
	const trialCount = await DbTrial.count({
		where: {
			endsAt: {
				[Op.gte]: new Date()
			}
		}
	})

	statistics.trials.set(trialCount)
}

async function collectPeopleInVoiceRooms() {
	const peopleInVoiceRooms = bot
		.getGuild()
		.channels.cache.filter(ch => ch.type === 'voice')
		.reduce((acc, val) => acc + (val as VoiceChannel).members.size, 0)

	statistics.peopleInVoiceRooms.set(peopleInVoiceRooms)
}
