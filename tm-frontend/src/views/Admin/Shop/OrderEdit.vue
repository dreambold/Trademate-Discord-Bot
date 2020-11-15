<template></template>
<template>
	<div>
		<div v-if="!order" class="d-flex justify-content-center my-3">
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<h3>Order #{{ order.id }}</h3>

			<div class="row">
				<div class="col-lg-6">
					<label>Item name</label>
					<p>{{ order.item.name }}</p>
				</div>
				<div class="col-lg-6">
					<label>User</label>
					<p>{{ order.user.name }}</p>
				</div>
				<div class="col-lg-6">
					<label>Ordered at</label>
					<p>{{ formatDateTime(order.createdAt) }}</p>
				</div>
				<div class="col-lg-6">
					<label>Fulfilled at</label>
					<div v-if="!order.fulfilledAt" class="d-flex align-items-center">
						<span class="badge badge-warning">Unfulfilled</span>
						<AppButton
							size="sm"
							class="ml-3"
							@click="markFulfilled(true)"
							:loading="saving"
						>Mark as fulfilled</AppButton>
					</div>
					<div v-else class="d-flex align-items-center">
						<span class="badge badge-success">{{ formatDateTime(order.fulfilledAt) }}</span>
						<AppButton
							size="sm"
							class="ml-3"
							type="secondary"
							:loading="saving"
							@click="markFulfilled(false)"
						>Mark as unfulfilled</AppButton>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import * as api from '../../../api'
import { mapState } from 'vuex'
import { formatDateTime } from '../../../utils'

export default {
	data() {
		return {
			order: null,
			saving: false
		}
	},

	async created() {
		if (!this.orders.loaded)
			await this.$store.dispatch('admin/fetchResource', { name: 'shopOrders' })

		this.reloadOrder()
	},

	methods: {
		formatDateTime,

		reloadOrder() {
			this.order =
				this.orders.v.length &&
				this.orders.v.find(order => order.id === parseInt(this.orderId))

			if (this.order) {
				this.order = this.$jsonCopy(this.order)
			} else {
				this.$notify({
					type: 'error',
					text: 'Could not find shop item to edit.'
				})
				this.$router.push('/admin/shop/orders')
			}
		},

		save() {
			this.saving = true

			api
				.post('admin/shop/orders', this.order)
				.then(async data => {
					await this.$store.dispatch('admin/fetchResource', {
						name: 'shopOrders'
					})

					this.$router.push('/admin/shop/orders/' + data.item.id)
				})
				.finally(() => {
					this.saving = false
					this.reloadOrder()
				})
		},

		markFulfilled(fulfilled) {
			if (fulfilled && !this.order.fulfilledAt) {
				this.order.fulfilledAt = new Date()
			} else if (!fulfilled && this.order.fulfilledAt) {
				if (
					!confirm(
						'Are you certain you wish to mark this order as unfulfilled?'
					)
				)
					return
				this.order.fulfilledAt = null
			}

			this.save()
		}
	},

	watch: {
		orderId(v, v2) {
			if (v !== v2) this.reloadOrder()
		}
	},

	computed: {
		...mapState({
			orders: s => s.admin.shopOrders,
			discordRoles: s => s.admin.discordRoles
		}),

		orderId() {
			return this.$route.params.id
		}
	}
}
</script>

<style lang="scss" scoped>
.badge {
	font-size: 0.9em;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
