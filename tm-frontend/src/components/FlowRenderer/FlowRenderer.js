import AppInput from '../ui/AppInput.vue'

export default {
	props: {
		value: {},

		flow: {}
	},

	components: {
		AppInput
	},

	data() {
		return {}
	},

	watch: {
		flow: {
			deep: true,
			handler() {
				if (!this.flow || !this.flow.blocks || !this.flow.blocks.length) {
					this.$emit('input', false)
					return
				}

				let good = true

				for (let block of this.flow.blocks) {
					if (block.promptType === 'text' && !block.promptAnswer) good = false
				}

				this.$emit('input', good)
			}
		}
	}
}
