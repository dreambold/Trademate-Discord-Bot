<template>
    <AppCard class="mt-3">
        <h2>Messages</h2>

        <p>Editable list of all templates the bot uses to send out automated messages.</p>

        <vue-good-table :columns="columns" :rows="rows" :search-options="{ enabled: true }">
            <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'slug'">
                    <code>{{ props.formattedRow[props.column.field] }}</code>
                </span>
                <span v-else-if="props.column.field == 'actions'">
                    <AppButton
                        size="sm"
                        @click="$router.push('/admin/messages/' + props.row.slug)"
                    >View</AppButton>
                </span>
                <span v-else>{{ props.formattedRow[props.column.field] }}</span>
            </template>
        </vue-good-table>
    </AppCard>
</template>

<script src="./Messages.js"></script>
