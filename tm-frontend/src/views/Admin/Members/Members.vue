<template>
	<div>
		<AppCard class="mt-3">
			<h2>
				Members
				<AppButton size="sm" class="ml-2" type="primary" @click="$router.push('/admin/members/new')">Add</AppButton>
			</h2>

			<p>List of all active & inactive members on file, with their information.</p>

			<vue-good-table
				:columns="columns"
				:rows="rows"
				:search-options="{ enabled: true }"
				styleClass="vgt-table condensed"
				:row-style-class="rowStyleClass"
				:sort-options="{ enabled: true, initialSortBy: {field: 'subscribedOn', type: 'desc'} }"
				:pagination-options="{ enabled: true, perPage: 10 }"
			>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'actions'">
						<AppButton size="sm" @click="$router.push('/admin/members/' + props.row.id)">View</AppButton>
					</span>
					<span v-else>{{props.formattedRow[props.column.field]}}</span>
				</template>
			</vue-good-table>
		</AppCard>
	</div>
</template>

<script src="./Members.js"></script>

<style lang="scss" scoped>
::v-deep .plan-length-1 {
	background-color: rgba(#b8e2de, 0.6);
}

::v-deep .plan-length-3 {
	background-color: rgba(#a0dffb, 0.6);
}

::v-deep .plan-length-12 {
	background-color: rgba(#ffbda8, 0.6);
}
</style>
