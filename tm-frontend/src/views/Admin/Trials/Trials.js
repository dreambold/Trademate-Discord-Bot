import AppCard from '../../../components/ui/AppCard.vue'
import AppButton from '../../../components/ui/AppButton.vue'
import { mapActions, mapState } from 'vuex'

export default {
	components: {
		AppButton,
		AppCard
	},

	data() {
		return {
			isLoading: true,
			columns: [
				{
					label: 'Discord',
					field: 'tag',
					sortable: false
				},
				{
					label: 'Discord ID',
					field: 'discordUserId',
					sortable: false
				},
				{
					label: 'Days in',
					field: 'daysIn',
					type: 'number'
				},
				{
					label: 'Days left',
					field: 'daysLeft',
					type: 'number'
				}
			]
		}
	},

	computed: {
		...mapState({
			trials: state => state.admin.trials
		}),

		rows() {
			return this.trials.v
		}
	},

	methods: {
		...mapActions({
			loadTrials: 'admin/loadTrials'
		})
	},

	mounted() {
		this.loadTrials()
	}
}
