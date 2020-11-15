<template>
	<AppModal @close="close">
		<div class="p-4" v-if="value !== undefined">
			<label class="mt-0">Interaction type</label>
			<select class="form-control" v-model="value.promptType" @change="resetValue">
				<option value="none">None (just send the message)</option>
				<option value="text">Simple text prompt</option>
				<option value="rating">Rating between 0 and 5</option>
				<option value="choice" v-if="!webSafe">Multiple choice</option>
			</select>

			<template v-if="value.promptType === 'choice'">
				<label class="mt-2">Choices</label>

				<div class="d-flex align-items-center">
					<AppInput v-model="form.emoji" placeholder="Add an emoji..." class="m-0 mr-2 flex-grow-1"></AppInput>
					<AppButton :disabled="!canAddEmoji" @click="addEmoji">+</AppButton>
				</div>

				<div>
					<span
						v-for="(emoji, i) in value.promptChoices"
						:key="i"
						@click="removeEmoji(emoji)"
						class="emoji"
					>{{ emoji }}</span>
				</div>
			</template>
		</div>
	</AppModal>
</template>

<script src="./InteractionModal.js"></script>

<style lang="scss" scoped>
::v-deep {
	.c-modal {
		width: 100%;
		max-width: 600px;
		margin: 20px;
	}
}

.emoji {
	cursor: pointer;
	font-size: 2em;
	display: inline-block;
	padding: 0 0.4rem 0.4rem 0;
}
</style>
