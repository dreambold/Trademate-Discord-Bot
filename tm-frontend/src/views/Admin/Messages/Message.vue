<template>
    <AppCard class="mt-3">
        <h2>Edit Message</h2>

        <div v-if="templates.loading" class="text-center">
            <AppLoader></AppLoader>
        </div>
        <div v-else>
            <label>Identifier</label>
            <AppInput :value="$route.params.slug" disabled></AppInput>

            <label>Description</label>
            <AppInput :value="rawTemplate.description" disabled></AppInput>

            <label>Template</label>
            <AppInput
                v-if="rawTemplate.template.type === 'string'"
                type="textarea"
                v-model="templateValue"
            ></AppInput>
            <EmbedEditor v-else v-model="templateValue" class="mb-2"></EmbedEditor>

            <AppButton @click="save">Save</AppButton>

            <h4 class="mt-3">Template placeholders</h4>
            <vue-good-table :columns="placeholderColumns" :rows="placeholderRows">
                <template slot="table-row" slot-scope="props">
                    <span v-if="props.column.field == 'placeholder'">
                        <code>{{ '{' + props.formattedRow[props.column.field] + '}' }}</code>
                    </span>
                    <span v-else>{{props.formattedRow[props.column.field]}}</span>
                </template>
            </vue-good-table>
        </div>
    </AppCard>
</template>

<script src="./Message.js"></script>
