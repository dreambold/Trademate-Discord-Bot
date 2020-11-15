import {
	ChartParams,
	getLastestMonths,
	range,
	ChartDataset,
	ChartData
} from '.'
import { Context } from 'koa'
import moment from 'moment'
import {
	Lifetime,
	DbUserLifetime
} from '../../../../../common/db/models/user-lifetime'
import { Op } from 'sequelize'

export async function run(params: ChartParams, ctx: Context) {
	const type: Lifetime = ctx.query.type
	const short = ctx.query.short === 'yes'

	const months = getLastestMonths(4)
	let days = type == Lifetime.FREE ? range(0, 21) : range(0, 91, 30)

	const lifetimes = await DbUserLifetime.findAll({
		where: {
			type,
			startAt: {
				[Op.gte]: months[months.length - 1].toISOString()
			}
		}
	})

	const chart: ChartData = {
		title:
			type === Lifetime.FREE
				? 'Free member lifetime %' + (short ? ' per 30 min' : ' per day')
				: 'Paid member lifetime %',
		datasets: []
	}

	for (let month of months) {
		let dataset: ChartDataset = {
			name: month.format('MMMM'),
			data: []
		}

		for (let day of days) {
			let hours = short ? day / 2 : day * 24

			if (month.clone().add(hours, 'hours') < moment())
				dataset.data.push([
					'' + day,
					lifetimes.filter(lifetime => {
						let startAt = moment(lifetime.startAt)

						// Not within the current month
						if (startAt < month || startAt > month.clone().endOf('month'))
							return false

						// Check wether it ended or not
						return (
							lifetime.endAt === null ||
							moment(lifetime.endAt) > startAt.clone().add(hours, 'hours')
						)
					}).length
				])
		}

		// Convert to % (if possible)
		if (dataset.data.length > 0 && dataset.data[0][1] !== 0) {
			let max = dataset.data[0][1]

			for (let entry of dataset.data) {
				entry[1] = parseFloat(((entry[1] / max) * 100).toFixed(5))
			}
		}

		chart.datasets.push(dataset)
	}

	return chart
}
