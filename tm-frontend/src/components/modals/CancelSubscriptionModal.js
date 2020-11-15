import AppModal from './AppModal.vue'
import AppButton from '../ui/AppButton.vue'

import * as api from '../../api'

export default {
	components: {
		AppModal,
		AppButton
	},

	data() {
		return {
			loading: false
		}
	},

	methods: {
		close() {
			if (!this.loading) {
				this.$emit('close')
			}
		},

		doCancel() {
			this.loading = true

			Promise.resolve()
				.then(async () => {
					let res = await api.get('user/membership/cancel')

					if (res.discountAvailable) {
						this.close()
						this.$router.push('/account/billing/cancel')
					} else {
						res = await api.post('user/membership/cancel')

						if (res.ok) {
							await this.$store.dispatch('fetchData')
							this.close()
							this.$notify('Subscription canceled.')
						} else {
							await this.$store.dispatch('fetchData')
							this.$notify({
								type: 'error',
								text:
									'Failed to cancel subscription. Please contact an administrator on Discord.'
							})
						}
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
					this.loading = false
					this.close()
				})
		}
	}
}
