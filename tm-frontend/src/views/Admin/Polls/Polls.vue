<template>
    <div>
        <AppCard class="mt-3">
            <div class="d-flex">
                <h2>Polls</h2>
                <AppButton class="ml-auto" @click="createPoll" :disabled="loading">New</AppButton>
            </div>

            <p>
                Polls allow you to send polls to users, but also just plain messages. Show archived polls
                <input
                    type="checkbox"
                    v-model="showArchived"
                />
            </p>

            <vue-good-table :columns="columns" :rows="rows" :search-options="{ enabled: true }">
                <template slot="table-row" slot-scope="props">
                    <span v-if="props.column.field == 'poll'">
                        <span class="d-block">
                            {{props.row.name}}
                            <span
                                v-if="props.row.system"
                                class="badge badge-secondary"
                            >System</span>&nbsp;
                            <span
                                v-if="props.row.webSafe"
                                class="badge badge-secondary"
                            >Web-Safe</span>&nbsp;
                            <span
                                v-if="props.row.archived"
                                class="badge badge-secondary"
                            >Archived</span>
                        </span>
                        <small class="text-muted">{{props.row.description}}</small>
                    </span>
                    <span v-if="props.column.field == 'actions'">
                        <AppButton
                            size="sm"
                            class="mr-2"
                            @click="$router.push('/admin/polls/' + props.row.id + '/edit')"
                        >Edit</AppButton>
                        <AppButton
                            size="sm"
                            @click="$router.push('/admin/polls/' + props.row.id + '/responses')"
                        >Responses</AppButton>
                    </span>
                    <span v-else>{{props.formattedRow[props.column.field]}}</span>
                </template>
            </vue-good-table>
        </AppCard>
    </div>
</template>

<script src="./Polls.js"></script>
