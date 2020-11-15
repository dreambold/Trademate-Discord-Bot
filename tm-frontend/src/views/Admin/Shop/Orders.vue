<template>
	<div>
		<div v-if="!shopOrders.loaded" class="d-flex justify-content-center my-3">
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<vue-good-table
				:columns="tableColumns"
				:rows="shopOrders.v"
				:sort-options="{ enabled: true, initialSortBy: {field: 'createdAt', type: 'desc'} }"
				:pagination-options="{ enabled: shopOrders.v.length > 15, perPage: 10 }"
			>
				<div slot="emptystate" class="d-flex align-items-center">No orders.</div>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'actions'">
						<AppButton size="sm" @click="$router.push('/admin/shop/orders/' + props.row.id)">View</AppButton>
					</span>
					<span v-if="props.column.field == 'status'">
						<span class="badge badge-warning" v-if="!props.row.fulfilledAt">Unfulfilled</span>
						<span class="badge badge-success" v-else>Fulfilled</span>
					</span>
					<span v-if="props.column.field == 'user.name'">
						<RouterLink
							:to="'/admin/members/' + props.row.user.id"
						>{{ props.formattedRow[props.column.field] }}</RouterLink>
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
					field: 'item.name',
					sortable: false
				},
				{
					label: 'User',
					field: 'user.name',
					sortable: false
				},
				{
					label: 'Date',
					field: 'createdAt',
					type: 'date',
					sortable: false,
					dateInputFormat: `yyyy-MM-dd'T'kk:mm:ss.SSS'Z'`,
					dateOutputFormat: 'd/MM/yyyy'
				},
				{
					label: 'Status',
					field: 'status',
					sortable: false,
					tdClass: 'table-action-column'
				},
				{
					label: '',
					field: 'actions',
					sortable: false,
					tdClass: 'text-right table-action-column'
				}
			]
		}
	},

	created() {
		this.$store.dispatch('admin/fetchResource', { name: 'shopOrders' })
	},

	computed: {
		...mapState({
			shopOrders: s => s.admin.shopOrders
		})
	}
}
</script>

<style lang="scss" scoped>
.badge {
	font-size: 0.9rem !important;
}
</style>
