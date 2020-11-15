import AppCard from '../../components/ui/AppCard.vue'

import * as api from '../../api'

export default {
	components: {
		AppCard
	},

	data() {
		return {
			sidebarLinks: [
				['Overview', '/account'],
				['Connections', '/account/connections'],
				['Billing', '/account/billing'],
				['Shop', '/account/shop']
			]
		}
	},

	created() {
		this.$store.dispatch('fetchData').then(() => {
			if (!this.$store.state.user) {
				window.location.assign('/')
			}
		})
	},

	methods: {
		logout() {
			api.get('../auth/logout').then(() => {
				window.location.assign('/')
			})
		}
	}
}
