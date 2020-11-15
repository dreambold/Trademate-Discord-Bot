import AppInput from '../../../components/ui/AppInput'
import AppCard from '../../../components/ui/AppCard'
import AppLoader from '../../../components/ui/AppLoader'
import AppButton from '../../../components/ui/AppButton'
import CreateReferralLinkModal from './CreateReferralLinkModal.vue'
import MemberPermissionsEditor from './MemberPermissionsEditor.vue'
import * as api from '../../../api'

import { mapState } from 'vuex'

export default {
	name: 'Member',

	components: {
		AppInput,
		AppCard,
		AppLoader,
		AppButton,
		CreateReferralLinkModal,
		MemberPermissionsEditor
	},

	data() {
		return {
			pane: 'details',
			member: {
				id: '',
				name: '',
				email: '',
				discordId: '',
				rank: 0,
				permissions: []
			},
			referralLinks: [],
			showReferralLinkModal: false,
			columns: [
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
					label: 'First Invoices Total',
					field: 'firstInvoiceTotal',
					type: 'number'
				},
				{
					label: 'Actions',
					field: 'actions',
					sortable: false
				}
			]
		}
	},

	computed: {
		...mapState({
			members: state => state.admin.members,
			user: s => s.user
		}),

		rawMember() {
			return this.members.v.find(member => member.id == this.$route.params.id)
		},

		isNew() {
			return this.$route.params.id === 'new'
		}
	},

	methods: {
		reloadMember() {
			if (this.isNew) {
				this.member = {
					id: 'new',
					name: '',
					email: '',
					discordId: '',
					rank: 0,
					permissions: []
				}
				return
			}

			const m = this.rawMember

			this.member = {
				id: m.id,
				name: m.name,
				email: m.email,
				discordId: m.discord && m.discord.id,
				rank: m.rank,
				permissions: m.permissions.slice()
			}

			this.referralLinks = []
			api.get('admin/referral-links', { userId: m.id }).then(d => {
				this.referralLinks = d.referralLinks
			})
		},

		save() {
			return api
				.post(
					'admin/members',
					this.isNew ? { ...this.member, id: undefined } : this.member
				)
				.then(async d => {
					await this.$store.dispatch('admin/loadMembers')
					this.$router.push('/admin/members/' + d.user.id)
				})
		},

		closeModal() {
			this.showReferralLinkModal = false
			this.reloadMember()
		},

		delReferralLink(id) {
			if (
				confirm(
					'Do you really want to deactivate the referral link? The same code will not be usable again, and the link will not be visible on the dashboard.'
				)
			) {
				api
					.del('admin/referral-links', {}, { id })
					.then(() => this.reloadMember())
			}
		}
	},

	async created() {
		if (this.isNew) {
			this.reloadMember()
			return
		}

		if (!this.rawMember) {
			await this.$store.dispatch('admin/loadMembers')

			if (!this.rawMember) {
				this.$notify({
					text: 'Member not found.',
					type: 'error'
				})
				this.$router.push('/admin')
			}
		} else {
			this.reloadMember()
		}
	},

	watch: {
		rawMember(m) {
			if (this.isNew) {
				return
			}

			if (!m) {
				this.$notify({
					text: 'Member not found.',
					type: 'error'
				})
				this.$router.push('/admin')

				return
			}

			this.reloadMember()
		},

		'$route.params.id'(id, oldId) {
			this.reloadMember()
		}
	}
}
