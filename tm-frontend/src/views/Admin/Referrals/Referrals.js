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
					label: 'User Name',
					field: 'name',
					sortable: false
				},
				{
					label: 'Discord',
					field: 'discord',
					sortable: false
				},
				{
					label: 'Link code',
					field: 'code',
					sortable: false
				},
				{
					label: 'Uses count',
					field: 'entriesCount',
					type: 'number'
				},
				{
					label: 'First Invoice Total',
					field: 'firstInvoiceTotal',
					type: 'number'
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
			referralLinks: state => state.admin.referralLinks
		}),

		rows() {
			return this.referralLinks.v
		}
	},

	methods: {
		...mapActions({
			loadReferralLinks: 'admin/loadReferralLinks'
		})
	},

	mounted() {
		this.loadReferralLinks()
	}
}
