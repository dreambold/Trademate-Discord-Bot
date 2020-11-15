import AppLoader from '../../components/ui/AppLoader.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AdminChart from '../../components/AdminChart/index.vue'

import { mapState } from 'vuex'

export default {
	components: {
		AppLoader,
		AppCard,
		AdminChart
	},

	data() {
		let d = {
			loading: true,
			statisticsDuration: null,
			statisticsDurationOptions: [
				{ value: '10minute', label: 'Period: by 10 minutes' },
				{ value: 'hourly', label: 'Period: hourly' },
				{ value: 'daily', label: 'Period: daily' },
				{ value: 'weekly', label: 'Period: weekly' }
			],
			statisticsPane: null,
			statisticsPaneOptions: [
				{ value: 'various', label: 'Various' },
				{ value: 'members', label: 'Member' },
				{ value: 'trials', label: 'Trial' },
				{ value: 'lifetimes', label: 'Lifetime' },
				{ value: 'channels', label: 'Channel' },
				{ value: 'csat', label: 'Customer Satisfaction' }
			]
		}

		d.statisticsDuration =
			d.statisticsDurationOptions[d.statisticsDurationOptions.length - 1]

		return d
	},

	computed: {
		...mapState({
			stats: state => state.admin.statistics
		}),

		end() {
			let dur = this.statisticsDuration && this.statisticsDuration.value
			let date = new Date()

			if (['daily', 'weekly'].includes(dur)) {
				date.setHours(23, 59, 59)
			}

			return date.getTime() / 1000
		},

		start() {
			let d = this.statisticsDuration && this.statisticsDuration.value
			if (d === 'daily') {
				return this.end - 10 * 24 * 60 * 60 // 7 days
			} else if (d === 'weekly') {
				return this.end - 8 * 7 * 24 * 60 * 60 // 8 weeks
			} else if (d === 'hourly') {
				return this.end - 18 * 60 * 60 // 18 hours
			} else if (d === '10minute') {
				return this.end - 2.5 * 60 * 60 // 1.5 hours
			}
		},

		step() {
			let d = this.statisticsDuration && this.statisticsDuration.value
			if (d === 'daily') {
				return 24 * 60 * 60 // 1 day
			} else if (d === 'weekly') {
				return 7 * 24 * 60 * 60 // 1 week
			} else if (d === 'hourly') {
				return 60 * 60 // 1 hour
			} else if (d === '10minute') {
				return 10 * 60
			}
		},

		currentPane() {
			return this.statisticsPane && this.statisticsPane.value
		}
	},

	mounted() {
		this.$store.dispatch('admin/loadStatistics')
	}
}
