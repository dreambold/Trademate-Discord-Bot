import AppButton from '../ui/AppButton.vue'
import MessageModal from './MessageModal.vue'
import InteractionModal from './InteractionModal.vue'

export default {
	props: {
		value: {}
	},

	components: {
		AppButton,
		MessageModal,
		InteractionModal
	},

	data() {
		return {
			editingMessageId: -1,
			editingInteractionId: -1,
			columns: [
				{
					label: 'Message',
					field: 'message',
					sortable: false
				},
				{
					label: 'Interaction',
					field: 'interaction',
					sortable: false
				},
				{
					label: 'Actions',
					field: 'actions',
					sortable: false
				}
			]
		}
	},

	computed: {
		rows() {
			return this.value.blocks.map(block => {
				return {
					...block,
					interaction:
						(block.promptType === 'none' && 'None') ||
						(block.promptType === 'choice' && 'Multiple choice') ||
						(block.promptType === 'text' && 'Text prompt') ||
						(block.promptType === 'rating' && 'Rating between 0 and 5')
				}
			})
		}
	},

	methods: {
		moveBlock(origIndex, diff) {
			this.value.blocks.splice(
				origIndex + diff,
				0,
				this.value.blocks.splice(origIndex, 1)[0]
			)
		},

		removeBlock(origIndex) {
			this.value.blocks.splice(origIndex, 1)
		},

		createBlockAfter(origIndex) {
			this.value.blocks.splice(origIndex + 1, 0, {
				type: 'message',
				message: 'My message',
				promptType: 'none'
			})
		}
	}
}
