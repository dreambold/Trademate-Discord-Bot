import { ChartParams, ChartData, ChartDataset } from '.'
import { Context } from 'koa'
import axios from 'axios'
import { mapAsync } from '../../../../utils/misc'

export async function run(params: ChartParams, ctx: Context) {
	const statistic = statistics[ctx.request.query.prom_name]
	if (!statistic) return ctx.throw(404)

	const chart: ChartData = {
		title: statistic.title,
		datasets: []
	}

	chart.datasets = await mapAsync(statistic.queries, async query => {
		let data = await runQuery(
			query[1],
			params.start.unix(),
			params.end.unix(),
			`${params.step}s`
		)
		data = data.data.result[0]?.values

		return {
			name: query[0],
			data: data ?? []
		}
	})

	return chart
}

const statistics: {
	[k: string]: { title: string; queries: [string, string][] }
} = {
	members: {
		title: 'All members',
		queries: [['Members', 'members']]
	},

	'members-change': {
		title: 'Members change',
		queries: [
			['Member join', 'round(increase(member_join[STEP]))'],
			['Member leave', 'round(increase(member_leave[STEP]))']
		]
	},

	'members-leave-day': {
		title: 'Members leave',
		queries: [['Member leave', 'round(increase(member_leave[STEP]))']]
	},

	'members-add-month': {
		title: 'Members join',
		queries: [['Members join', 'round(increase(members_join[STEP]))']]
	},

	trials: {
		title: 'Trials',
		queries: [['Trials', 'trials']]
	},

	'trials-change': {
		title: 'Trials change',
		queries: [
			['Trial starts', 'round(increase(trial_start[STEP]))'],
			['Trial ends', 'round(increase(trial_end[STEP]))'],
			['Trial conversions', 'round(increase(client_conversion[STEP]))']
		]
	},

	'voice-rooms': {
		title: 'Voice rooms',
		queries: [
			[
				'Max people in voice rooms',
				'max_over_time(people_in_voice_rooms[STEP])'
			]
		]
	}
}

async function runQuery(
	query: string,
	start: number,
	end: number,
	step: string
): Promise<any> {
	let targetURI = process.env.PROMETHEUS_URI + '/api/v1/query_range'

	const resp = await axios.get(targetURI, {
		params: {
			query: query.replace(/STEP/g, step),
			start,
			end,
			step
		}
	})

	return resp.data
}
