<template>
	<div class="form-group">
		<input
			v-if="type !== 'textarea'"
			:type="type"
			:placeholder="placeholder"
			:value="value"
			:disabled="disabled"
			@input="$emit('input', $event.target.value)"
			class="form-control"
			:step="step"
		/>
		<textarea
			v-else
			:placeholder="placeholder"
			:value="value"
			:disabled="disabled"
			@input="$emit('input', $event.target.value)"
			class="form-control"
		></textarea>

		<small class="form-text text-muted" v-if="helpGiven">
			<slot></slot>
		</small>
	</div>
</template>

<script>
export default {
	props: {
		type: {
			type: String,
			default: 'text'
		},

		placeholder: {
			type: String,
			default: ''
		},

		value: {
			default: ''
		},

		disabled: {
			type: Boolean,
			default: false
		},

		step: {}
	},

	computed: {
		helpGiven() {
			return (
				this.$slots &&
				this.$slots.default &&
				this.$slots.default.length &&
				this.$slots.default[0].text.length
			)
		}
	}
}
</script>

<style lang="scss" scoped>
.form-control {
	border: 2px solid #d8dde6;
	padding: 0.5rem 0.8rem;

	height: calc(1.5em + 1rem + 2px);

	&:hover {
		border-color: #a3afc4;
	}

	&:focus {
		box-shadow: none;
		border-color: rgb(77, 97, 252);
	}

	&::placeholder {
		color: #838c9c;
	}
}

textarea.form-control {
	min-height: 5.8em;
}
</style>
