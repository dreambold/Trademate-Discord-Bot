<template>
	<AppModal @close="close">
		<div class="p-4">
			<h4 class="mb-4 text-center">Login with Email</h4>

			<AppInput
				v-model="form.email"
				type="email"
				placeholder="john.wick@gmail.com"
				:disabled="loading"
			></AppInput>
			<AppButton
				class="btn-login"
				:disabled="!formComplete || loading"
				:loading="loading"
				@click="submitForm"
			>Request login link</AppButton>
			<small class="back-link text-muted" @click="close">Return back</small>
		</div>
	</AppModal>
</template>

<script src="./EmailLoginModal.js"></script>

<style lang="scss" scoped>
.btn-login {
	margin-top: 10px;
	display: block;
	width: 100%;

	&.btn-discord {
		background-color: #7289da;
		border-color: #7289da;
	}
}

.back-link {
	cursor: pointer;
	margin: 0;
	margin-top: 3px;
	text-align: center;
	display: block;
}
</style>
