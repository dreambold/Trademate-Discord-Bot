import AppModal from '../../../components/modals/AppModal.vue'
import AppInput from '../../../components/ui/AppInput'
import AppButton from '../../../components/ui/AppButton'

import * as api from '../../../api'

export default {
	props: ['userId'],

	components: {
		AppModal,
		AppInput,
		AppButton
	},

	data() {
		return {
			code: ''
		}
	},

	methods: {
		close() {
			this.$emit('close')

			this.code = ''
		},

		save() {
			api
				.post(
					'admin/user-referrals',
					{},
					{ userId: this.userId, askedCode: this.code || undefined }
				)
				.then(() => {
					this.close()
				})
		}
	}
}
