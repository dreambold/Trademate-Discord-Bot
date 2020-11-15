<template>
	<div>
		<div v-if="!shopItems.loaded" class="d-flex justify-content-center my-3">
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<vue-good-table
				:columns="tableColumns"
				:rows="shopItems.v"
				:pagination-options="{ enabled: shopItems.v.length > 10, perPage: 10 }"
			>
				<div slot="emptystate" class="d-flex align-items-center">No items.</div>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'actions'">
						<AppButton size="sm" @click="$router.push('/admin/shop/items/' + props.row.id)">View</AppButton>
					</span>
					<span v-else-if="props.column.field == 'type'">{{ itemTypeMap[props.row.type] }}</span>
					<span v-else-if="props.column.field == 'price'">{{ props.formattedRow[props.column.field] }} XP</span>
					<span v-else-if="props.column.field == 'name'">
						{{ props.formattedRow[props.column.field] }}
						<span
							class="badge badge-warning ml-1"
							v-if="props.row.archived"
						>Archived</span>
					</span>
					<span v-else>{{ props.formattedRow[props.column.field] }}</span>
				</template>
			</vue-good-table>

			<div class="d-flex">
				<AppButton class="mt-3 ml-auto" type="secondary" @click="$router.push('/admin/shop/items/new')">
					Add Item
					<i class="fas fa-plus ml-1"></i>
				</AppButton>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			itemTypeMap: {
				'discord-roles': 'Discord Role',
				manual: 'Manual',
				'membership-extension': 'Membership extension'
			},
			tableColumns: [
				{
					label: 'Item',
					field: 'name',
					sortable: false
				},
				{
					label: 'Type',
					field: 'type',
					sortable: false
				},
				{
					label: 'Price',
					field: 'price',
					sortable: false
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
		this.$store.dispatch('admin/fetchResource', { name: 'shopItems' })
	},

	computed: {
		...mapState({
			shopItems: s => s.admin.shopItems
		})
	}
}
</script>

<style lang="scss" scoped>
.badge {
	font-size: 0.8em;
}
</style>
