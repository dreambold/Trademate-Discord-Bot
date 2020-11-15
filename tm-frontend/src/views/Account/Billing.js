import AppCard from '../../components/ui/AppCard.vue'
import AppLoader from '../../components/ui/AppLoader.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import DiscordCard from '../../components/DiscordCard.vue'
import PlanSelector from '../../components/PlanSelector.vue'
import ASelector from '../../components/ASelector.vue'
import CancelSubscriptionModal from '../../components/modals/CancelSubscriptionModal.vue'

import { Card as StripeCard, createToken } from 'vue-stripe-elements-plus'

import { mapState } from 'vuex'
import * as api from '../../api'
import { handlePaymentFollowup, formatDate } from '../../utils'

export default {
	components: {
		AppCard,
		AppLoader,
		DiscordCard,
		AppInput,
		AppButton,
		PlanSelector,
		StripeCard,
		CancelSubscriptionModal,
		ASelector
	},

	computed: {
		...mapState([
			'loaded',
			'user',
			'plans',
			'stripeKey',
			'subscription',
			'products'
		]),

		canSavePlan() {
			return (
				this.form.planId !== (this.subscription && this.subscription.planId)
			)
		},

		isLegacyPlan() {
			return (
				this.subscription &&
				this.subscription.setUp &&
				this.subscription.planId &&
				!this.plans.find(p => p.id === this.subscription.planId)
			)
		},

		displayPlans() {
			if (!this.selectedProduct) return this.plans

			return this.plans.filter(
				plan => plan.product === this.selectedProduct.stripeProductId
			)
		},

		/**
		 * Message displayed just after the heading
		 */
		popMessage() {
			if (!this.subscription) {
				return
			}

			if (this.subscription.amountDue > 0) {
				return {
					type: 'error',
					text: `You have $${this.subscription.amountDue /
						100} USD in unpaid invoices. Update your subscription method now to resolve the issue.`
				}
			} else if (!this.subscription.setUp) {
				return {
					type: 'error',
					text: `You have no active subscription. Please select one to get access to member channels.`
				}
			} else if (this.subscription.willCancel) {
				return {
					type: 'error',
					text: `Your subscription will cancel automatically on ${formatDate(
						this.subscription.willCancel
					)} (day/month/year). Updating your subscription will re-activate automatic renewal.`
				}
			}
		}
	},

	data() {
		return {
			loading: false,
			cardValid: false,
			showCancelModal: false,
			selectedProduct: null,
			form: {
				planId: ''
			}
		}
	},

	created() {
		this.reloadPlanId()
	},

	methods: {
		// Used to make a one-way binding
		reloadPlanId() {
			if (this.subscription && this.subscription.planId) {
				this.form.planId = this.subscription.planId
				this.selectedProduct =
					this.products.length > 0
						? this.products.find(p =>
								p.stripePlanIds.includes(this.subscription.planId)
						  )
						: this.products[0]
			}
		},

		saveCard() {
			const cb = async () => {
				const token = await createToken()

				const sub = await api.post('user/payment-card', {
					cardToken: token.token.id
				})

				await handlePaymentFollowup(sub)
			}

			this.loading = true
			cb()
				.then(() => {
					this.$notify('Card has been saved.')

					this.$store.dispatch('fetchData')
				})
				.catch(e => {
					console.error(e)
					this.$notify({
						type: 'error',
						text: 'Error: ' + e.message
					})
				})
				.finally(() => {
					this.loading = false
				})
		},

		savePlan() {
			if (!confirm('Are you certain you wish to change your plan?')) {
				this.reloadPlanId()
				return
			}

			this.loading = true
			api
				.post('user/membership/subscribe', {
					planId: this.form.planId
				})
				.then(() => {
					this.$notify('Plan changed successfully.')

					this.$store.dispatch('fetchData')
				})
				.finally(() => {
					this.loading = false
				})
		},

		cancelModalClosed() {
			this.showCancelModal = false
			this.$store.dispatch('fetchData')
		}
	},

	watch: {
		'subscription.planId'() {
			this.reloadPlanId()
		},

		selectedProduct(p) {
			const plan = this.plans.find(plan => plan.id === this.subscription.planId)

			if (p && p.stripeProductId === (plan && plan.product)) {
				this.form.planId = plan.id
			}
		}
	}
}
