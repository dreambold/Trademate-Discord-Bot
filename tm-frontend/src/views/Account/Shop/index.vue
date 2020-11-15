<template>
	<div>
		<AppCard class="mb-3">
			<div class="d-flex align-items-center">
				<h3 class="m-0">Shop</h3>
				<div class="text-muted ml-auto">
					You have
					<b>{{ xpAvailable }} XP</b> available
				</div>
			</div>
		</AppCard>

		<ul class="nav nav-tabs">
			<li class="nav-item">
				<RouterLink to="/account/shop" exact exact-active-class="active" class="nav-link">Items</RouterLink>
			</li>
			<li class="nav-item">
				<RouterLink
					to="/account/shop/order-history"
					exact
					exact-active-class="active"
					class="nav-link"
				>My Purchases</RouterLink>
			</li>
		</ul>
		<AppCard class="TheCard">
			<RouterView></RouterView>
		</AppCard>
	</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
	computed: {
		...mapState(['xpAvailable'])
	}
}
</script>

<style lang="scss" scoped>
.nav-tabs {
	border-bottom: 0;

	.nav-item a {
		border: 0;
		outline: none;

		&.active {
			background-color: rgba(0, 0, 0, 0.08);
		}
	}
}

.TheCard {
	border-top-left-radius: 0;
}
</style>
