<template>
	<div class="mt-3">
		<ul class="nav nav-tabs">
			<li class="nav-item">
				<RouterLink to="/admin/shop/orders" active-class="active" class="nav-link">Orders</RouterLink>
			</li>
			<li class="nav-item">
				<RouterLink to="/admin/shop/items" active-class="active" class="nav-link">Items</RouterLink>
			</li>
		</ul>
		<AppCard class="TheCard">
			<RouterView></RouterView>
		</AppCard>
	</div>
</template>

<script>
export default {
	created() {
		this.checkDefaultRoute()
	},

	watch: {
		$route: {
			deep: true,
			handler() {
				this.checkDefaultRoute()
			}
		}
	},

	methods: {
		checkDefaultRoute() {
			if (this.$route.path === '/admin/shop')
				this.$router.push('/admin/shop/orders')
		}
	}
}
</script>

<style lang="scss" scoped>
.nav-tabs {
	border-bottom: 0;

	.nav-item a {
		border: 0;
		outline: none;
	}
}

.TheCard {
	border-top-left-radius: 0;
}
</style>
