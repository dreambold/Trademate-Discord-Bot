<template>
	<AppCard class="mt-3">
		<h2>Poll responses</h2>

		<p>
			Responses to
			<b>{{ flow ? flow.name : '' }}</b>
			. There are {{ flowResponses.ongoingCount }} entries still waiting for an answer.
		</p>

		<p>
			Select a question to show:
			<select v-model="showBlockIndex">
				<option :value="-1">None</option>
				<option v-for="(block, i) in responseBlocks" :value="block.index" :key="i">{{ block.message }}</option>
			</select>
		</p>

		<vue-good-table
			:columns="columns"
			:rows="rows"
			:search-options="{ enabled: true }"
			:sort-options="{ enabled: true, initialSortBy: { field: 'createdAt', type: 'desc' } }"
			:pagination-options="paginationOptions"
		>
			<template slot="table-row" slot-scope="props">
				<span v-if="props.column.field == 'actions'">
					<AppButton size="sm" @click="viewingFlowId = props.row.id">View</AppButton>
				</span>
				<span
					v-else-if="props.column.field == 'blockResponse'"
				>{{ props.row.blocks[showBlockIndex] ? props.row.blocks[showBlockIndex].promptAnswer : '' }}</span>
				<span v-else>{{props.formattedRow[props.column.field]}}</span>
			</template>
		</vue-good-table>

		<PollResponseModal v-show="viewingFlow" :response="viewingFlow" @close="viewingFlowId = 0"></PollResponseModal>
	</AppCard>
</template>

<script src="./PollResponses.js"></script>
