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
		title: 'CSAT Sample Size',
		datasets: [
			{
				name: 'Sample Size',
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
		const count = await DbUsinEntry.count({
			where: {
				flowId: csatFlow.id,
				createdAt: {
					[Op.gt]: moment.unix(period - params.step).toISOString(),
					[Op.lte]: moment.unix(period).toISOString()
				}
			}
		})

		datasets.datasets[0].data.push([period, count])
	}

	return datasets
}
