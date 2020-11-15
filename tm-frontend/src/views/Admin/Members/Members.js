import AppCard from '../../../components/ui/AppCard.vue'
import AppButton from '../../../components/ui/AppButton.vue'
import { mapActions, mapState } from 'vuex'
import { formatDate } from '../../../utils'

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
					label: 'Email',
					field: 'email',
					sortable: false
				},
				{
					label: 'Discord',
					field: 'discord',
					sortable: false
				},
				{
					label: 'Plan',
					field: 'plan'
				},
				{
					label: 'Subscribed on',
					field: 'subscribedOn',
					type: 'date',
					dateInputFormat: 'd/MM/yyyy',
					dateOutputFormat: 'd/MM/yyyy'
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
			members: state => state.admin.members
		}),

		rows() {
			return this.members.v.map(member => {
				return {
					id: member.id,
					email: member.email,
					discord: (member.discord && member.discord.tag) || '—',
					plan: (member.plan && member.plan.name) || '—',
					subscribedOn:
						(member.subscribedOn && formatDate(member.subscribedOn)) || '—',
					interval: member.plan && member.plan.interval
				}
			})
		}
	},

	methods: {
		...mapActions({
			loadMembers: 'admin/loadMembers'
		}),

		rowStyleClass(row) {
			if (!row.interval) return ''

			return 'plan-length-' + row.interval
		}
	},

	mounted() {
		this.loadMembers()
	}
}
