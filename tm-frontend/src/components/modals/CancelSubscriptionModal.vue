<template>
	<AppModal @close="close">
		<div class="p-4">
			<label>Cancel subscription?</label>

			<div class="button-container mt-3">
				<AppButton @click="close" :disabled="loading" class="mr-2">Go back</AppButton>
				<AppButton @click="doCancel" :disabled="loading" type="danger">Cancel now</AppButton>
			</div>
		</div>
	</AppModal>
</template>

<script src="./CancelSubscriptionModal.js"></script>

<style lang="scss" scoped>
.button-container {
	display: flex;
	align-items: center;
}
</style>
