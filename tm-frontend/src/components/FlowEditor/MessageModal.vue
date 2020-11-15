<template>
    <AppModal @close="close">
        <div class="p-4" v-if="value !== undefined">
            <label>Message type</label>
            <select class="form-control" v-model="value.type" @change="resetValue">
                <option value="message">Text</option>
                <option value="embed">Embed</option>
            </select>

            <label class="mt-2">Message content</label>
            <AppInput v-if="value.type === 'message'" type="textarea" v-model="value.message"></AppInput>
            <EmbedEditor v-else v-model="value.message"></EmbedEditor>
        </div>
    </AppModal>
</template>

<script src="./MessageModal.js"></script>

<style lang="scss" scoped>
::v-deep {
    .c-modal {
        width: 100%;
        max-width: 600px;
        margin: 20px;
    }
}
</style>
