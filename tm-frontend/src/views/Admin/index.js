import { mapState, mapActions } from 'vuex'

import * as api from '../../api'

export default {
	data() {
		return {
			links: [
				['Members', '/admin', 'VIEW_USERS'],
				['Trials', '/admin/trials', 'VIEW_TRIALS'],
				['Referrals', '/admin/referrals', 'VIEW_REFERRALS'],
				['Polls', '/admin/polls', 'VIEW_POLLS'],
				['Messages', '/admin/messages', 'VIEW_MESSAGES'],
				['Statistics', '/admin/statistics', 'VIEW_STATISTICS'],
				['Ranks & levels', '/admin/levels', 'VIEW_RANKS'],
				['Shop & orders', '/admin/shop', 'VIEW_SHOP']
			]
		}
	},

	computed: {
		...mapState(['user', 'loading']),

		ulinks() {
			if (!this.user) return

			return this.links.filter(
				l =>
					l.length === 2 ||
					this.user.rank > 0 ||
					this.user.permissions.includes('ADMINISTRATOR') ||
					this.user.permissions.includes(l[2])
			)
		}
	},

	async created() {
		if (!this.loading && !this.user) {
			await this.fetchData()
		}

		if (
			!(
				this.user &&
				(this.user.rank > 0 ||
					this.user.permissions?.includes('VIEW_DASHBOARD'))
			)
		) {
			this.preventAccess()
		}
	},

	watch: {
		user(val) {
			if (
				!this.loading &&
				!(val && (val.rank > 0 || val.permissions?.includes('VIEW_DASHBOARD')))
			) {
				this.preventAccess()
			}
		}
	},

	methods: {
		...mapActions(['fetchData']),

		preventAccess() {
			this.$notify('You do not have the permissions necessary to go here.')
			this.$router.push('/')
		},

		insertCSS(link) {
			let file = document.createElement('link')
			file.rel = 'stylesheet'
			file.href = link
			document.head.appendChild(file)
		},

		logout() {
			api.get('../auth/logout').then(() => {
				window.location.assign('/')
			})
		}
	},

	// We have to insert some additionnal CSS files
	beforeMount() {
		const files = [
			'https://fonts.googleapis.com/css?family=Lato:400,700&display=swap|Material+Icons',
			'https://use.fontawesome.com/releases/v5.2.0/css/all.css'
		]

		files.forEach(file => this.insertCSS(file))
	}
}
