<template>
	<div>
		<div v-if="!shopOrderHistory.loaded" class="d-flex justify-content-center my-3">
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<p>Your last ten purchases in the XP shop on record.</p>

			<vue-good-table :columns="tableColumns" :rows="shopOrderHistory.v">
				<div slot="emptystate" class="d-flex align-items-center">No orders.</div>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'item.price'">{{ props.formattedRow[props.column.field] }} XP</span>
					<span v-else-if="props.column.field == 'status'">
						<span class="badge badge-warning" v-if="!props.row.fulfilledAt">Pending</span>
						<span class="badge badge-success" v-else>Fulfilled</span>
					</span>
					<span v-else>{{ props.formattedRow[props.column.field] }}</span>
				</template>
			</vue-good-table>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			tableColumns: [
				{
					label: 'Item',
					field: 'item.name'
				},
				{
					label: 'Price',
					field: 'item.price'
				},
				{
					label: 'Purchase date',
					field: 'createdAt',
					type: 'date',
					sortable: false,
					dateInputFormat: `yyyy-MM-dd'T'kk:mm:ss.SSS'Z'`,
					dateOutputFormat: 'd/MM/yyyy'
				},
				{
					label: 'Status',
					field: 'status'
				}
			]
		}
	},

	created() {
		if (!this.shopOrderHistory.loaded)
			this.$store.dispatch('fetchResource', { name: 'shopOrderHistory' })
	},

	computed: {
		...mapState({
			shopOrderHistory: s => s.shopOrderHistory
		})
	}
}
</script>

<style lang="scss" scoped>
.badge {
	font-size: 0.9em;
}
</style>
