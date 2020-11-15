<template>
	<div class="flow-tree">
		<div v-for="(block, i) in flow.blocks || []" :key="i">
			<label>{{ block.message }}</label>

			<AppInput type="textarea" v-if="block.promptType === 'text'" v-model="block.promptAnswer"></AppInput>
		</div>
	</div>
</template>

<script src="./FlowRenderer.js"></script>

<style lang="scss" scoped>
.flow-tree {
	overflow: hidden;

	&.flow-editable {
		border: 2px solid #d8dde6;
		border-radius: 0.25rem;
	}
}
</style>
