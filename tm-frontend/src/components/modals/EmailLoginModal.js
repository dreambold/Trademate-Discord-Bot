import AppModal from './AppModal.vue'
import AppInput from '../ui/AppInput.vue'
import AppButton from '../ui/AppButton.vue'

import * as api from '../../api'

export default {
	name: 'EmailLoginModal',

	components: {
		AppModal,
		AppInput,
		AppButton
	},

	data() {
		return {
			loading: false,

			// The user cannot send an email twice to the same address
			previouslySent: [],

			form: {
				email: ''
			}
		}
	},

	methods: {
		close() {
			this.$emit('close')
		},

		submitForm() {
			this.loading = true

			api
				.post(
					'../auth/email',
					{},
					{
						email: this.form.email
					}
				)
				.then(() => {
					this.previouslySent.push(this.form.email)
					this.$notify({
						title: 'Email sent',
						text: 'Your login email has been sent. Please check your inbox.'
					})
				})
				.finally(() => {
					this.loading = false
				})
		}
	},

	computed: {
		formComplete() {
			return (
				/^.+@.+\..+$/.test(this.form.email) &&
				!this.previouslySent.includes(this.form.email)
			)
		}
	}
}
