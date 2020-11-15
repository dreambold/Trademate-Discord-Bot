<template>
	<AppModal @close="close">
		<div class="p-4">
			<AppInput v-model="code" placeholder="Link code">
				Leave empty to have automatically generated. Maximum 8 characters
				long.
			</AppInput>
			<div class="d-flex align-items-center">
				<AppButton :disabled="code.length > 8" @click="save">Create</AppButton>
				<AppButton @click="close" type="secondary" class="ml-2" size="sm">Close</AppButton>
			</div>
		</div>
	</AppModal>
</template>

<script src="./CreateReferralLinkModal.js"></script>
