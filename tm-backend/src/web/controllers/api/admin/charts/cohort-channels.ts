import { ChartParams, getLastestMonths, ChartDataset, ChartData } from '.'
import { Context } from 'koa'
import { DbCohortEvent } from '../../../../../common/db/models/cohort-event'
import { Op } from 'sequelize'
import moment from 'moment'

export async function run(params: ChartParams, ctx: Context) {
	const months = getLastestMonths(4)
	const durations = [1, 5, 10]

	const allCohortEvents: DbCohortEvent[] = await DbCohortEvent.findAll({
		where: {
			cohortAt: {
				[Op.gte]: months[months.length - 1].toDate(),
				[Op.lte]: months[0]
					.clone()
					.endOf('month')
					.toDate()
			}
		}
	})

	const chart: ChartData = {
		title: 'Avg channels posted in after X days by month of joining',
		datasets: []
	}

	for (let month of months) {
		const dataset: ChartDataset = {
			name: month.format('MMMM'),
			data: []
		}

		dataset.data = durations.map(duration => {
			const cohortEvents = allCohortEvents.filter(
				ev =>
					ev.cohortAt >= month.toDate() &&
					ev.cohortAt <=
						month
							.clone()
							.endOf('month')
							.toDate() &&
					ev.eventAt <=
						moment(ev.cohortAt)
							.clone()
							.add(duration, 'days')
							.toDate()
			)

			let users: { [k: string]: string[] } = {}

			for (let cohortEv of cohortEvents) {
				users[cohortEv.discordUserId] = users[cohortEv.discordUserId] ?? []

				for (let channel of cohortEv.data || []) {
					if (!users[cohortEv.discordUserId].includes(channel)) {
						users[cohortEv.discordUserId].push(channel)
					}
				}
			}

			return [
				duration + ' days in',
				Object.values(users).reduce((prev, curr) => prev + curr.length, 0) /
					(Object.keys(users).length || 1)
			]
		})

		chart.datasets.push(dataset)
	}

	return chart
}
