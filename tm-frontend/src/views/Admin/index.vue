<template>
	<div class="app">
		<div class="navbar navbar-expand-lg navbar-light">
			<div class="container">
				<a
					href
					@click.prevent="$router.push('/admin').catch(err => {})"
					class="navbar-brand"
				>{{ APP_VARIANT.name }} Dashboard</a>

				<div class="navbar-nav ml-auto">
					<a class="nav-item nav-link" @click.prevent="logout">
						<i class="fas fa-sign-out-alt"></i>
					</a>
				</div>
			</div>
		</div>

		<div class="container">
			<div class="row">
				<div class="col-lg-3">
					<AppCard class="mt-3 d-none d-sm-block">
						<img src="@/assets/tm-logo.png" alt="Trademate logo" class="Logo" />
					</AppCard>
					<AppCard class="mt-3 p-2">
						<nav class="nav sidenav flex-column" v-if="user">
							<RouterLink
								class="nav-link"
								v-for="(link, i) in ulinks"
								:key="i"
								:to="link[1]"
								:exact="i === 0"
							>{{ link[0] }}</RouterLink>
						</nav>
						<div v-else class="d-flex align-items-center justify-content-center py-5">
							<AppLoaderX></AppLoaderX>
						</div>
					</AppCard>
				</div>
				<div class="col-lg-9">
					<RouterView v-if="user"></RouterView>
					<AppCard v-else class="mt-3 d-flex align-items-center justify-content-center py-4">
						<AppLoaderX></AppLoaderX>
					</AppCard>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="./index.js"></script>

<style lang="scss" scoped>
a {
	cursor: pointer;
}

.app {
	min-width: 100vw;
	min-height: 100vh;
	padding-bottom: 20px;
	background-color: #f3f3f3;
}

.navbar {
	background-color: white;
	box-shadow: 0 0 11px rgba(0, 0, 0, 0.13);
}

.Logo {
	height: 85px;
	background-color: #000b42;
	display: block;
	margin: auto;
	border-radius: 20px;
}

.sidenav a {
	border-radius: 8px;
	padding: 6px 10px;
	margin-bottom: 4px;
	color: darken(rgba(99, 148, 216, 1), 25);

	&:hover,
	&:active,
	&.router-link-exact-active,
	&.router-link-active {
		background-color: rgba(99, 148, 216, 0.08);
	}

	&:last-child {
		margin-bottom: 0;
	}
}

@media screen and (min-width: 1300px) {
	.container {
		max-width: 1200px;
	}
}
</style>
