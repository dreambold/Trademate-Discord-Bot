import PlanSelector from '../components/PlanSelector.vue'
import ASelector from '../components/ASelector.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppButton from '../components/ui/AppButton.vue'
import EmailLoginModal from '../components/modals/EmailLoginModal.vue'

import * as api from '../api'

import { Card as StripeCard, createToken } from 'vue-stripe-elements-plus'
import { mapState, mapActions } from 'vuex'

export default {
	name: 'GetAccess',

	components: {
		PlanSelector,
		AppInput,
		AppButton,
		EmailLoginModal,
		StripeCard,
		ASelector
	},

	data() {
		return {
			tosChecked: false,
			step: 1,
			disabled: false,
			showEmailModal: false,
			cardValid: false,
			subscribeNewsletter: false,
			cardToken: null,
			cardUsed: false,
			selectedProduct: null,

			stripeOptions: {
				style: {
					base: {
						color: '#495057',
						fontFamily: 'Lato, "Helvetica Neue", Helvetica, sans-serif',
						fontSmoothing: 'antialiased',
						fontSize: '16px',
						'::placeholder': {
							color: '#838c9c'
						}
					}
				}
			},

			form: {
				planId: '',
				name: '',
				email: ''
			}
		}
	},

	computed: {
		selectedPlan() {
			return this.plans.find(
				plan => plan.id == (this.form.planId || this.plans[0].id)
			)
		},

		displayPlans() {
			if (!this.selectedProduct) return this.plans

			return this.plans.filter(
				plan => plan.product === this.selectedProduct.stripeProductId
			)
		},

		formComplete() {
			return (
				this.cardValid &&
				this.form.planId &&
				this.form.name.length > 3 &&
				this.form.email.length > 6
			)
		},

		...mapState([
			'stripeKey',
			'plans',
			'products',
			'subscription',
			'user',
			'hasNewsletter'
		]),
		...mapState({ stateLoaded: 'loaded' }),

		pricingLine() {
			if (!this.selectedPlan) return ''

			let period = this.selectedPlan.interval
			if (period === 1) period = 'month'
			else if (period === 3) period = '3 months'
			else if (period === 12) period = 'year'

			if (this.selectedPlan.dollarTrial) {
				return `First week $1 USD then $${this.selectedPlan.amount /
					100}.00 USD every ${period}.`
			} else {
				return `First period $${this.selectedPlan.amount /
					100}.00 USD then $${this.selectedPlan.amount /
					100}.00 USD every ${period}.`
			}
		}
	},

	created() {
		this.checkUser()
	},

	watch: {
		user(u, oldU) {
			if (u && !oldU) this.checkUser()
		},

		products(p) {
			if (!this.selectedProduct && p.length > 0) {
				this.selectedProduct = p[0]
			}
		}
	},

	methods: {
		...mapActions({
			refreshAccountData: 'fetchData'
		}),

		checkUser() {
			if (this.user) {
				this.$router.push(this.user.rank > 0 ? '/admin' : '/account')
			}
		},

		continueDiscord() {
			window.location.replace(this.$store.state.urls.api + '/auth/discord')
		},

		continueEmail() {
			this.showEmailModal = true
		},

		toStep3(e) {
			e.preventDefault()
			this.disabled = true
			this.cardUsed = false

			Promise.resolve()
				.then(async () => {
					const token = await createToken()

					this.cardToken = token.token
					this.step = this.step + 1
				})
				.catch(e => {
					if (!e.apiError) {
						console.error(e)
						this.$notify({
							type: 'error',
							text: 'Failed to charge your card. Please try another one.'
						})
					}
				})
				.finally(() => {
					this.disabled = false
				})
		},

		pay(e) {
			e.preventDefault()
			this.disabled = true

			// Execute the payment flow
			Promise.resolve()
				.then(async () => {
					const res = await api.post('subscribe', {
						email: this.form.email,
						name: this.form.name,
						planId: this.form.planId,
						cardToken: this.cardUsed ? undefined : this.cardToken.id,
						subscribeNewsletter: this.subscribeNewsletter
					})
					this.cardUsed = true

					if (res.paymentStatus === 'requires_payment_method') {
						throw Error('Failed to charge card.')
					} else if (res.paymentStatus === 'requires_action') {
						const stripe = window.Stripe(this.stripeKey)
						let r = await stripe.confirmCardPayment(res.paymentIntentSecret)
						if (r.error) throw Error(r.error)

						const s = await api.post('subscribe', {
							done: true,
							planId: this.form.planId
						})

						if (!s.ok) {
							throw Error('Failed to charge card.')
						}
					}

					// Signup workflow has completed
					await this.refreshAccountData()

					if (this.subscription.setUp) {
						this.$notify(`Welcome to ${this.APP_VARIANT.name}!`)
						this.$router.push('/account/connections')
					}
				})
				.catch(e => {
					if (!e.apiError) {
						console.error(e)
						this.$notify({
							type: 'error',
							text: 'Failed to charge your card. Please try another one.'
						})
					}
				})
				.finally(() => {
					this.disabled = false
				})
		}
	}
}
