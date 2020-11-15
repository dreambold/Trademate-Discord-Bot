import RealAdminChart from './RealAdminChart'
import * as api from '../../api'

export default {
	name: 'AdminChart',

	props: [
		'name',
		'options',
		'start',
		'end',
		'step',
		'roundDate',
		'colors',
		'colorBackground',
		'beginAtZero'
	],

	components: {
		RealAdminChart
	},

	data() {
		return {
			plottingData: null,
			title: ''
		}
	},

	created() {
		this.loadData()
	},

	methods: {
		loadData() {
			if (!this.name || !this.start || !this.end || !this.step) return

			this.plottingData = null

			api
				.get('admin/chart', {
					name: this.name,
					start: this.start,
					end: this.end,
					step: this.step,
					...(this.options || {})
				})
				.then(d => {
					this.plottingData = d.datasets
					this.title = d.title
				})
		}
	},

	watch: {
		step() {
			this.loadData()
		},
		name() {
			this.loadData()
		},
		start() {
			this.loadData()
		},
		end() {
			this.loadData()
		},
		options() {
			this.loadData()
		}
	}
}
