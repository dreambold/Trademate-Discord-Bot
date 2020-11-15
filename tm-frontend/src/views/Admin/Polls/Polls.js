import AppCard from '../../../components/ui/AppCard'
import AppButton from '../../../components/ui/AppButton.vue'

import * as api from '../../../api'
import { mapState } from 'vuex'
import { formatDateTime } from '../../../utils'

export default {
	components: {
		AppCard,
		AppButton
	},

	data() {
		return {
			loading: false,
			showArchived: false,
			columns: [
				{
					label: 'Poll',
					field: 'poll'
				},
				{
					label: 'Last sent',
					field: 'lastSent'
				},
				{
					label: 'Actions',
					field: 'actions',
					sortable: false,
					tdClass: 'text-right'
				}
			]
		}
	},

	computed: {
		...mapState({
			flows: state => state.admin.flows
		}),

		rows() {
			return this.flows.v
				.map(flow => ({
					...flow,
					lastSent: flow.lastSent ? formatDateTime(flow.lastSent) : 'Never'
				}))
				.filter(flow => !flow.archived || (flow.archived && this.showArchived))
		}
	},

	created() {
		this.$store.dispatch('admin/loadFlows')
	},

	methods: {
		createPoll() {
			this.loading = true

			Promise.resolve()
				.then(async () => {
					const flow = await api.post('admin/flows')
					await this.$store.dispatch('admin/loadFlows')

					this.$router.push('/admin/polls/' + flow.id + '/edit')
				})
				.catch(e => {
					this.$notify({
						type: 'error',
						text: 'Error: ' + e.message
					})
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
