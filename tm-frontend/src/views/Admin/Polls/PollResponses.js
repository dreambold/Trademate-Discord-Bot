import AppCard from '../../../components/ui/AppCard.vue'
import AppButton from '../../../components/ui/AppButton.vue'
import PollResponseModal from './PollResponseModal'

import { mapState } from 'vuex'
import { formatDateTime } from '../../../utils'

export default {
	components: {
		AppCard,
		AppButton,
		PollResponseModal
	},

	data() {
		return {
			viewingFlowId: 0,
			showBlockIndex: -1,
			paginationOptions: {
				enabled: true
			}
		}
	},

	computed: {
		...mapState({
			flowResponses: state => state.admin.flowResponses,
			flows: state => state.admin.flows
		}),

		flow() {
			return this.flows.v.find(
				flow => flow.id === parseInt(this.$route.params.id)
			)
		},

		rows() {
			return this.flowResponses?.v ?? []
		},

		columns() {
			let res = [
				{
					label: 'Discord user tag',
					field: 'discordUserTag',
					sortable: false
				},
				{
					label: 'Filled in at',
					field: 'createdAt',
					type: 'date',
					dateInputFormat: `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`,
					dateOutputFormat: 'dd/MM/yyyy HH:mm'
				}
			]

			if (this.showBlockIndex !== -1) {
				res.push({
					label: 'Response',
					field: 'blockResponse'
				})
			}

			res.push({
				label: 'Actions',
				field: 'actions',
				sortable: false,
				tdClass: 'text-right'
			})

			return res
		},

		viewingFlow() {
			if (this.viewingFlowId == 0) return

			return this.flowResponses.v.find(entry => entry.id == this.viewingFlowId)
		},

		responseBlocks() {
			return this.flow?.blocks
				.map((block, i) => {
					return {
						index: i,
						message: block.message,
						promptType: block.promptType
					}
				})
				.filter(block => block.promptType !== 'none')
		}
	},

	async created() {
		if (!this.flow) {
			await this.$store.dispatch('admin/loadFlows')

			if (!this.flow) {
				this.$notify({
					type: 'error',
					text: 'Poll not found'
				})
				this.$router.push('/admin/polls')
			}
		}

		await this.$store.dispatch('admin/loadFlowResponses', this.$route.params.id)
	}
}
