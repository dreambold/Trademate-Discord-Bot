import AppInput from '../components/ui/AppInput.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppCard from '../components/ui/AppCard.vue'
import DiscordCard from '../components/DiscordCard.vue'
import * as api from '../api'

export default {
	components: {
		DiscordCard,
		AppInput,
		AppButton,
		AppCard
	},

	data() {
		return {
			error: false,
			loading: false,
			email: '',
			info: {}
		}
	},

	created() {
		this.loadInfo()
	},

	methods: {
		loadInfo() {
			return
			this.loading = true

			api
				.get('trial-info', { userId: this.$route.params.userId })
				.then(d => {
					this.info = d
				})
				.catch(e => {
					this.error = true
				})
				.finally(() => {
					this.loading = false
				})
		},

		activate() {
			this.loading = true

			api
				.post(
					'trial-info',
					{},
					{ userId: this.$route.params.userId, email: this.email }
				)
				.then(d => {
					this.info = d
				})
				.catch(e => {
					this.error = true
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
