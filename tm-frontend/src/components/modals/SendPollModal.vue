<template>
    <AppModal @close="close">
        <div class="p-4">
            <label>Send poll to</label>
            <select class="form-control" v-model="sendFilter">
                <option value="me">Me</option>
                <option value="members">Members</option>
                <option value="non-members">Non-members</option>
                <option value="trials">Trials</option>
                <option value="all">Everyone</option>
            </select>

            <AppButton
                :type="sendFilter === 'me' ? 'primary' : 'danger'"
                :disabled="loading"
                @click="submitForm"
                class="mt-2"
            >Send</AppButton>
        </div>
    </AppModal>
</template>

<script src="./SendPollModal.js"></script>

<style lang="scss" scoped>
</style>
