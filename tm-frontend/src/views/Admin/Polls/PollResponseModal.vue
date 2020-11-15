<template>
    <AppModal @close="close">
        <div v-if="response" class="p-4">
            <div v-for="(block, i) in blocksWithAnswers" :key="i">
                <label v-if="block.type === 'embed'">Embed: {{ block.message.title }}</label>
                <label v-else>{{ block.message }}</label>

                <p>{{ block.promptAnswer }}</p>
            </div>
        </div>
    </AppModal>
</template>

<script>
import AppModal from '../../../components/modals/AppModal'

export default {
    name: 'PollResponseModal',

    components: {
        AppModal
    },

    props: {
        response: {}
    },

    computed: {
        blocksWithAnswers() {
            if (!this.response) return

            return this.response.blocks.filter(block => block.promptAnswer)
        }
    },

    methods: {
        close() {
            this.$emit('close')
        }
    }
}
</script>
