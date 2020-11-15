import { range, ChartParams, ChartData } from '.'
import { Context } from 'koa'
import { DbUsinEntry } from '../../../../../common/db/models/usin-entry'
import { Op } from 'sequelize'
import moment from 'moment'
import { DbUsinFlow } from '../../../../../common/db/models/usin-flow'

export async function run(params: ChartParams, ctx: Context) {
	const periods = range(params.end.unix(), params.start.unix(), params.step)
	periods.reverse()

	const datasets: ChartData = {
		title: 'CSAT Survey Results',
		datasets: [
			{
				name: 'Results',
				data: []
			}
		]
	}

	const csatFlow = await DbUsinFlow.findOne({
		where: {
			name: 'CSAT7Days'
		}
	})
	if (!csatFlow) return datasets

	for (let period of periods) {
		const entries = await DbUsinEntry.findAll({
			where: {
				flowId: csatFlow.id,
				createdAt: {
					[Op.gt]: moment.unix(period - params.step).toISOString(),
					[Op.lte]: moment.unix(period).toISOString()
				}
			}
		})

		const results = entries
			.map(e => e.blocks.find(b => b.promptType === 'rating'))
			.filter(v => !!v)
			.map(b => parseInt(b!.promptAnswer))
			.filter(v => !isNaN(v))

		const average =
			results.reduce((prev, curr) => prev + curr, 0) / (results.length || 1)

		datasets.datasets[0].data.push([
			period,
			results.length ? parseFloat(average.toFixed(2)) : null!
		])
	}

	return datasets
}
