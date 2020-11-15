<template>
	<div>
		<div v-if="!shopItems.loaded" class="d-flex justify-content-center my-3">
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<div
				v-if="categories.length === 0"
				class="text-center text-muted my-2"
			>There is currently nothing available in the shop.</div>
			<template v-else>
				<div v-for="(category, i) in categories" :key="i">
					<h5 v-if="categories.length > 1" :class="{'mt-2': i > 0}">{{ category.title }}</h5>

					<div class="row">
						<div class="col-lg-6" v-for="(item, j) in category.items" :key="j">
							<AppCard class="mb-3">
								<b>{{ item.name }}</b>
								<p v-if="item.description" class="mb-0">{{ item.description }}</p>
								<div class="d-flex mt-2 align-items-center">
									<span class="mr-2 text-muted">
										Price:
										<b>{{ formatItemPrice(item.price) }}</b> XP
									</span>
									<AppButton
										size="sm ml-auto"
										@click="purchase(item)"
										:disabled="!xpAvailable || xpAvailable < item.price || purchasing"
									>Purchase</AppButton>
								</div>
							</AppCard>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import * as api from '../../../api'
import { mapState } from 'vuex'

export default {
	data() {
		return {
			purchasing: false
		}
	},

	created() {
		if (!this.shopItems.loaded)
			this.$store.dispatch('fetchResource', { name: 'shopItems' })
	},

	computed: {
		...mapState({
			shopItems: s => s.shopItems,
			xpAvailable: s => s.xpAvailable
		}),

		categories() {
			const v = this.shopItems.v
			const ret = [
				{
					title: 'Discord Roles',
					items: v.filter(item => item.type === 'discord-roles')
				},
				{
					title: 'Membership extensions',
					items: v.filter(item => item.type === 'membership-extension')
				},
				{
					title: 'Other',
					items: v.filter(item => item.type === 'manual')
				}
			]

			return ret.filter(r => r.items.length > 0)
		}
	},

	methods: {
		formatItemPrice(p) {
			return p > 1000 ? Math.ceil(p / 1000) + 'k' : p
		},

		purchase(item) {
			if (
				confirm(
					'Are you certain to purchase ' +
						item.name +
						' with ' +
						this.formatItemPrice(item.price) +
						'XP?'
				)
			) {
				this.purchasing = true
				api
					.post('user/shop/order', { itemId: item.id })
					.then(() => {
						this.$store.dispatch('fetchData')
						this.$store.dispatch('fetchResource', { name: 'shopItems' })

						this.$notify(
							'Purchase completed.' +
								(item.type === 'manual'
									? ' You will be concacted by our staff if needed to complete your order.'
									: '')
						)
					})
					.finally(() => {
						this.purchasing = false
					})
			}
		}
	}
}
</script>
