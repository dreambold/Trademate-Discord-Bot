import AppCard from '../../../components/ui/AppCard'
import AppButton from '../../../components/ui/AppButton.vue'
import AppInput from '../../../components/ui/AppInput.vue'
import AppLoader from '../../../components/ui/AppLoader.vue'
import FlowEditor from '../../../components/FlowEditor/FlowEditor.vue'
import SendPollModal from '../../../components/modals/SendPollModal.vue'

import * as api from '../../../api'

import { mapState } from 'vuex'

export default {
	components: {
		AppCard,
		AppButton,
		AppInput,
		AppLoader,
		FlowEditor,
		SendPollModal
	},

	data() {
		return {
			showSendPrompt: false,

			flow: {
				name: '',
				description: '',
				blocks: [],
				archived: false,
				system: false,
				webSafe: false
			}
		}
	},

	computed: {
		...mapState({
			flows: state => state.admin.flows
		}),

		rawFlow() {
			return this.flows.v.find(
				flow => flow.id === parseInt(this.$route.params.id)
			)
		},

		canSend() {
			return (
				this.flow &&
				this.rawFlow &&
				!this.rawFlow.system &&
				!this.rawFlow.archived &&
				this.rawFlow.blocks.length > 0 &&
				JSON.stringify(this.flow) ===
					JSON.stringify(this.cloneFlow(this.rawFlow))
			)
		}
	},

	methods: {
		reloadFlow() {
			this.flow = this.cloneFlow(this.rawFlow)
		},

		save() {
			return api
				.post('admin/flows', this.flow)
				.then(() => this.$store.dispatch('admin/loadFlows'))
		},

		cloneFlow(flow) {
			return {
				id: flow.id,
				name: flow.name,
				description: flow.description,
				blocks: JSON.parse(JSON.stringify(flow.blocks)),
				autoSendHours: flow.autoSendHours || 168,
				autoSendAudience: flow.autoSendAudience || 'trials',
				autoSendCount: flow.autoSendCount || 10,
				autoSendEnabled: !!flow.autoSendNext,
				archived: flow.archived,
				system: flow.system,
				webSafe: flow.webSafe
			}
		}
	},

	async created() {
		if (!this.rawFlow) {
			await this.$store.dispatch('admin/loadFlows')

			if (!this.rawFlow) {
				this.$notify({
					type: 'error',
					text: 'Poll not found'
				})
				this.$router.push('/admin/polls')
			}
		} else {
			this.reloadFlow()
		}
	},

	watch: {
		rawFlow(flow) {
			if (!flow) {
				this.$notify({
					type: 'error',
					text: 'Poll not found'
				})
				this.$router.push('/admin/polls')

				return
			}

			this.reloadFlow()
		}
	}
}
