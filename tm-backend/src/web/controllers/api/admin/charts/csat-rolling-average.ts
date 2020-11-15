import { Context } from 'koa'
import { ChartParams, range } from '.'
import { run as runCsat } from './csat'

export async function run(params: ChartParams, ctx: Context) {
	const csat = await runCsat(
		{
			...params,
			start: params.start.clone().subtract(30, 'days')
		},
		ctx
	)

	const skippedPeriods = range(
		params.start
			.clone()
			.subtract(30, 'days')
			.unix(),
		params.start.unix(),
		params.step
	).length

	const dataset = csat.datasets[0]
	dataset.name = 'CSAT Rolling Average (30 days)'

	for (let i = skippedPeriods; i < dataset.data.length; i += 1) {
		let data = range(i - skippedPeriods, i)
			.map(v => dataset.data[v + 1][1])
			.filter(v => !!v)

		dataset.data[i][1] = data.length
			? data.reduce((prev, curr) => prev + curr, 0) / data.length
			: null!
	}

	// Remove the backlog entries used for the averaging over time
	dataset.data = dataset.data.slice(skippedPeriods)

	return csat
}
