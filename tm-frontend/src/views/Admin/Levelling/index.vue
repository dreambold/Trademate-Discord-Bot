<template>
	<div class="mt-3">
		<ul class="nav nav-tabs">
			<li class="nav-item">
				<RouterLink to="/admin/levels" exact exact-active-class="active" class="nav-link">Ranks</RouterLink>
			</li>
			<li class="nav-item">
				<RouterLink
					to="/admin/levels/multipliers"
					exact
					exact-active-class="active"
					class="nav-link"
				>Channel bonus</RouterLink>
			</li>
		</ul>
		<AppCard class="TheCard">
			<RouterView></RouterView>
		</AppCard>
	</div>
</template>

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
