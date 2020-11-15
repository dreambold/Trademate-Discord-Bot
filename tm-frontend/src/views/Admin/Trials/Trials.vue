<template>
	<div>
		<AppCard class="mt-3">
			<h2>Trials</h2>

			<p>List of active trials.</p>

			<vue-good-table
				:columns="columns"
				:rows="rows"
				:search-options="{ enabled: true }"
				styleClass="vgt-table condensed"
				:sort-options="{ enabled: true, initialSortBy: {field: 'daysLeft', type: 'asc'} }"
				:pagination-options="{ enabled: true, perPage: 10 }"
			>
				<template slot="table-row" slot-scope="props">
					<span>{{props.formattedRow[props.column.field]}}</span>
				</template>
			</vue-good-table>
		</AppCard>
	</div>
</template>

<script src="./Trials.js"></script>
