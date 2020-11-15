import AppCard from '../../components/ui/AppCard.vue'
import AppLoader from '../../components/ui/AppLoader.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import FlowRenderer from '../../components/FlowRenderer/FlowRenderer.vue'

import { mapState } from 'vuex'
import * as api from '../../api'

export default {
	components: {
		AppCard,
		AppLoader,
		AppButton,
		AppInput,
		FlowRenderer
	},

	data() {
		return {
			loading: true,
			saving: false,
			flowCompleted: false,
			flow: false
		}
	},

	computed: {
		...mapState(['subscription', 'user'])
	},

	methods: {
		doCancel() {
			this.saving = true
			Promise.resolve()
				.then(async () => {
					let res = await api.post('user/membership/cancel', {
						flow: this.flow
					})

					if (res.ok) {
						await this.$store.dispatch('fetchData')
						this.$router.push('/account')
						this.$notify('Subscription canceled.')
					} else {
						await this.$store.dispatch('fetchData')
						this.$notify({
							type: 'error',
							text:
								'Failed to cancel subscription. Please contact an administrator on Discord.'
						})
					}
				})
				.catch(e => {
					if (!e.apiError) {
						console.error(e)
						this.$notify({
							type: 'error',
							text: 'Error: ' + e.message
						})
					}
				})
				.finally(() => {
					this.saving = false
				})
		},

		doDiscount() {
			this.saving = true

			Promise.resolve()
				.then(async () => {
					let res = await api.post('user/membership/get-discount', {
						flow: this.flow
					})

					await this.$store.dispatch('fetchData')
					this.$notify('You will now get 50% off the next invoice!')
					this.$router.push('/account')
				})
				.catch(e => {
					if (!e.apiError) {
						console.error(e)
						this.$notify({
							type: 'error',
							text: 'Error: ' + e.message
						})
					}
				})
				.finally(() => {
					this.saving = false
				})
		}
	},

	created() {
		if (!this.user || !this.subscription || this.subscription.hasHadDiscount) {
			this.$router.push('/account')
		}

		Promise.resolve()
			.then(async () => {
				this.flow = await api.get('user/membership/cancel', {
					flow: true
				})
				if (!this.flow) throw Error('Failed to load poll')
				this.loading = false
			})
			.catch(e => {
				if (!e.apiError) {
					this.$notify({
						type: 'error',
						text: 'Error: ' + e.message
					})
				}
			})
	}
}
