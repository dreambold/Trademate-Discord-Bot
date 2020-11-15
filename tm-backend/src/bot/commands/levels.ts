import { Command, CommandContext } from '../bot/Command'

export default class LevelsCommand extends Command {
	constructor() {
		super()

		this.name = 'levels'
	}

	async execute({ message }: CommandContext) {
		return message.reply(
			`The level leaderboard is available here: ${process.env.WEB_BASE_URI}/#/ranks`
		)
	}
}
