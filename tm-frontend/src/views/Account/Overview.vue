<template>
	<div>
		<AppCard class="mb-3">
			<h3 class="m-0">Overview</h3>
		</AppCard>

		<AppCard>
			<div v-if="!loaded" class="text-center">
				<AppLoader></AppLoader>
			</div>
			<div v-else>
				<p>
					Welcome to the {{ APP_VARIANT.name }} membership dashboard! You can
					come back here anytime by logging in with your Discord account or with
					your e-mail address.
				</p>
				<p class="mb-0">
					Please use the menu to access connection and subscription settings.
				</p>
			</div>
		</AppCard>
	</div>
</template>

<script src="./Overview.js"></script>
