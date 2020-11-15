import { ChartParams, getLastestMonths, ChartDataset, ChartData } from '.'
import { Context } from 'koa'
import {
	CohortEventType,
	DbCohortEvent
} from '../../../../../common/db/models/cohort-event'
import { Op } from 'sequelize'
import { mapAsync } from '../../../../utils/misc'

export async function run(params: ChartParams, ctx: Context) {
	const months = getLastestMonths(4)
	const types = [
		CohortEventType.JOIN,
		CohortEventType.CONVERT_PREMIUM,
		CohortEventType.TRIAL_STARTED
	]

	const chart: ChartData = {
		title: 'User events chart',
		datasets: []
	}

	for (let type of types) {
		let dataset: ChartDataset = {
			name: type,
			data: []
		}

		dataset.data = await mapAsync(months, async month => {
			return [
				month.format('MMMM'),
				await DbCohortEvent.count({
					where: {
						cohortAt: {
							[Op.gte]: month.toISOString(),
							[Op.lt]: month
								.clone()
								.endOf('month')
								.toISOString()
						},
						type
					}
				})
			] as [string, number]
		})

		chart.datasets.push(dataset)
	}

	return chart
}
