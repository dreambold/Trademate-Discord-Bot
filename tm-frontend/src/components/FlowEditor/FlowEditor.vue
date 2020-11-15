<template>
    <div>
        <vue-good-table :columns="columns" :rows="rows">
            <div slot="emptystate" class="d-flex align-items-center">
                No blocks.
                <AppButton
                    size="sm"
                    class="ml-auto"
                    @click="createBlockAfter(-1)"
                    v-if="!value.archived"
                >
                    <i class="fas fa-plus"></i>
                </AppButton>
            </div>
            <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'actions'">
                    <AppButton
                        class="mr-2"
                        size="sm"
                        :disabled="props.row.originalIndex === 0 || value.archived"
                        @click="moveBlock(props.row.originalIndex, -1)"
                    >
                        <i class="fas fa-arrow-up"></i>
                    </AppButton>
                    <AppButton
                        class="mr-2"
                        size="sm"
                        :disabled="props.row.originalIndex === rows.length - 1 || value.archived"
                        @click="moveBlock(props.row.originalIndex, 1)"
                    >
                        <i class="fas fa-arrow-down"></i>
                    </AppButton>
                    <AppButton
                        class="mr-2"
                        size="sm"
                        type="danger"
                        :disabled="value.archived"
                        @click="removeBlock(props.row.originalIndex)"
                    >
                        <i class="fas fa-times"></i>
                    </AppButton>
                    <AppButton
                        size="sm"
                        :disabled="value.archived"
                        @click="createBlockAfter(props.row.originalIndex)"
                    >
                        <i class="fas fa-plus"></i>
                    </AppButton>
                </span>

                <!-- Message column -->
                <span
                    v-else-if="props.column.field === 'message'"
                    class="d-flex align-items-center"
                >
                    <div v-if="props.row.type === 'embed'" class="mr-2 text-limit">
                        <b>Embed:</b>
                        {{ (props.row.message && props.row.message.title) || 'No title' }}
                    </div>
                    <div v-else class="mr-2 text-limit">{{ props.row.message }}</div>

                    <div class="ml-auto">
                        <AppButton
                            size="sm"
                            type="secondary"
                            @click="editingMessageId = props.row.originalIndex"
                        >
                            <i class="fas fa-pencil-alt"></i>
                        </AppButton>
                    </div>
                </span>

                <!-- Interactions column -->
                <span
                    v-else-if="props.column.field === 'interaction'"
                    class="d-flex align-items-center"
                >
                    <div class="mr-2">{{props.formattedRow[props.column.field]}}</div>

                    <div class="ml-auto">
                        <AppButton
                            size="sm"
                            type="secondary"
                            @click="editingInteractionId = props.row.originalIndex"
                        >
                            <i class="fas fa-pencil-alt"></i>
                        </AppButton>
                    </div>
                </span>
                <span v-else>{{props.formattedRow[props.column.field]}}</span>
            </template>
        </vue-good-table>

        <MessageModal
            v-show="editingMessageId !== -1"
            v-model="value.blocks[editingMessageId]"
            @close="editingMessageId = -1"
        ></MessageModal>

        <InteractionModal
            v-show="editingInteractionId !== -1"
            v-model="value.blocks[editingInteractionId]"
            :web-safe="value.webSafe"
            @close="editingInteractionId = -1"
        ></InteractionModal>
    </div>
</template>

<script src="./FlowEditor.js"></script>

<style lang="scss" scoped>
.flow-tree {
    overflow: hidden;
    border: 2px solid #d8dde6;
    border-radius: 0.25rem;
}

::v-deep .vgt-table td:last-child,
::v-deep .vgt-table th:last-child {
    width: 1% !important;
    white-space: nowrap;
}

::v-deep .vgt-table td:nth-child(1) .text-limit,
::v-deep .vgt-table th:nth-child(1) .text-limit {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 500px;
}
</style>
