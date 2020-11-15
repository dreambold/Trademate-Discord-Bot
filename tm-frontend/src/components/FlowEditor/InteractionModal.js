import AppInput from '../ui/AppInput.vue'
import AppButton from '../ui/AppButton.vue'
import AppCard from '../ui/AppCard.vue'
import AppModal from '../modals/AppModal.vue'

import hasEmoji from 'has-emoji'

export default {
    props: {
        value: {},

        webSafe: false
    },

    components: {
        AppCard,
        AppInput,
        AppButton,
        AppModal
    },

    data() {
        return {
            form: {
                emoji: ''
            }
        }
    },

    methods: {
        close() {
            this.$emit('close')
        },

        resetValue() {
            let v = null

            if (this.value.promptType === 'choice') v = []

            this.value.promptChoices = v
        },

        addEmoji() {
            if (!(this.form.emoji in this.value.promptChoices)) {
                this.value.promptChoices.push(this.form.emoji)
                this.form.emoji = ''
            }
        },

        removeEmoji(emoji) {
            this.value.promptChoices = this.value.promptChoices.filter(
                e => e != emoji
            )
        }
    },

    computed: {
        canAddEmoji() {
            return hasEmoji(this.form.emoji)
        }
    }
}
