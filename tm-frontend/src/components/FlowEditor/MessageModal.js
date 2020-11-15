import AppModal from '../modals/AppModal.vue'
import AppInput from '../ui/AppInput.vue'
import EmbedEditor from '../EmbedEditor.vue'

import { EMPTY_EMBED } from '../../utils'

export default {
    components: {
        AppModal,
        AppInput,
        EmbedEditor
    },

    props: {
        value: {}
    },

    methods: {
        close() {
            this.$emit('close')
        },

        resetValue() {
            if (this.value.type === 'embed') {
                this.value.message = EMPTY_EMBED()
            } else {
                this.value.message = 'My message'
            }
        }
    }
}
