import { server } from '../../../../server'
import moment from 'moment'
import { Context } from 'koa'
import { APIError } from '../../../../utils/misc'
import { NeedsPermissionMiddleware } from '../../../../middleware/misc'

export interface ChartDataset {
	name: string
	data: Array<[string | number, number]>
}

export interface ChartData {
	title: string
	datasets: ChartDataset[]
}

export interface ChartParams {
	/**
	 * Name of the called-for chart
	 */
	name: string

	/**
	 * When to start the chart
	 */
	start: moment.Moment

	/**
	 * When to end the chart
	 */
	end: moment.Moment

	/**
	 * Step is the space between each point on the graph
	 */
	step: number
}

const charts: {
	[k: string]: () => (params: ChartParams, ctx: Context) => any
} = {
	prom: () => require('./prom').run,
	lifetimes: () => require('./lifetimes').run,
	'cohort-events': () => require('./cohort-events').run,
	'cohort-channels': () => require('./cohort-channels').run,
	csat: () => require('./csat').run,
	'csat-sample-size': () => require('./csat-sample-size').run,
	'csat-rolling-average': () => require('./csat-rolling-average').run
}

export function init() {
	server.router.get(
		'/api/admin/chart',
		NeedsPermissionMiddleware('VIEW_STATISTICS'),
		async ctx => {
			const params: ChartParams = {
				name: ctx.request.query.name,
				start: moment.unix(parseFloat(ctx.request.query.start)),
				end: moment.unix(parseFloat(ctx.request.query.end)),
				step: parseInt(ctx.request.query.step)
			}

			if (
				!params.name ||
				!params.start.isValid() ||
				!params.end.isValid() ||
				params.end < params.start ||
				params.step < 60 ||
				typeof charts[params.name] !== 'function'
			) {
				throw new APIError('Invalid chart request')
			}

			ctx.body = {
				status: 200,
				data: await charts[params.name]()(params, ctx as any)
			}
		}
	)
}

export function range(start: number, stop: number, step = 1) {
	let arr: number[] = []

	if (start < stop) {
		if (step < 0) step = step * -1

		for (let i = start; i < stop; i += step) {
			arr.push(i)
		}
	} else {
		if (step > 0) step = step * -1

		for (let i = start; i > stop; i += step) {
			arr.push(i)
		}
	}

	return arr
}

export function getLastestMonths(n: number) {
	return range(0, n)
		.map(n =>
			moment()
				.subtract(n, 'months')
				.startOf('month')
		)
		.filter(
			month =>
				moment()
					.year(2020)
					.month(2)
					.startOf('month') <= month
		)
}
