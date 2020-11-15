<template>
	<div class="container">
		<h1 class="text-center mb-5 mt-5">Get {{ APP_VARIANT.name }} Trial</h1>

		<p>The {{ APP_VARIANT.name }} trial is no more.</p>

		<!-- <p v-if="error">
			An error occured, please retry later or contact an Administrator on
			Discord.
		</p>
		<p v-else-if="loading">Loading...</p>
		<div v-else>
			<label>Your Account</label>
			<DiscordCard :account="info.user"></DiscordCard>

			<AppCard
				v-if="info.trial && new Date(info.trial.endsAt) > new Date()"
				class="mt-4"
				type="success"
			>You currently enjoy a {{ APP_VARIANT.name }} trial!</AppCard>
			<AppCard
				v-else-if="info.trial"
				class="mt-4"
				type="error"
			>It seems you have already had a {{ APP_VARIANT.name }} trial.</AppCard>

			<label class="mt-4">Subscribe to our newsletter</label>
			<AppInput v-model="email" placeholder="john.wick@gmail.com" :disabled="info.trial">
				By entering your email address here, you will automatically be
				subscribed to the {{ APP_VARIANT.name }} newsletter. If you do not want
				to be subscribed, do not enter your email here.
			</AppInput>

			<p class="mb-2 mt-4">Click the following button to activate your trial!</p>
			<AppButton class="mt-0" @click="activate" :disabled="info.trial">Activate Trial!</AppButton>
		</div>-->
	</div>
</template>

<script src="./GetTrial.js"></script>

<style lang="scss" scoped>
.container {
	max-width: 550px;
	margin: auto;
	padding: 16px;
}
</style>
