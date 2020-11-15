<template>
	<button
		class="btn"
		:class="[ 'btn-' + type, 'btn-' + size ]"
		:style="style"
		@click="click"
		:disabled="disabled || loading"
		ref="button"
	>
		<div v-show="!showLoadingIcon">
			<slot></slot>
		</div>
		<div v-show="showLoadingIcon">
			<AppLoaderX variant="light"></AppLoaderX>
		</div>
	</button>
</template>

<script>
export default {
	props: {
		disabled: {
			default: false
		},

		type: {
			default: 'primary'
		},

		size: {
			default: 'md'
		},

		loading: {
			default: false
		}
	},

	data() {
		return {
			style: {},
			showLoadingIcon: false
		}
	},

	methods: {
		click(e) {
			if (!this.disabled) {
				this.$emit('click', e)
			}
		},

		setLoading() {
			if (!this.loading) {
				this.style = {}
			} else {
				this.style.height = this.$refs.button.offsetHeight + 'px'
				this.style.width = this.$refs.button.offsetWidth + 'px'
				this.style.display = 'flex'
				this.style.justifyContent = 'center'
				this.style.alignItems = 'center'
			}
			this.showLoadingIcon = this.loading
		}
	},

	created() {
		if (this.loading) setTimeout(() => this.setLoading(), 0)
	},

	watch: {
		loading(v, oldV) {
			setTimeout(() => this.setLoading(), 0)
		}
	}
}
</script>

<style lang="scss">
:root .btn {
	font-weight: bold;
	box-shadow: 0 2px 4px 0 rgba(136, 144, 195, 0.2),
		0 5px 15px 0 rgba(37, 44, 97, 0.15);
	padding: 12px 20px 12px;
	line-height: 1.2;

	border-radius: 4px;
	font-size: 14px;
	transition: transform 0.2s, background-color 0.2s;
	transform: translateY(0);
	display: inline-block;

	&:disabled {
		cursor: not-allowed;
	}

	&:hover:not(:disabled) {
		transform: translateY(-3px);
		text-decoration: none;
	}

	&:active:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px 0 rgba(136, 144, 195, 0.2),
			0 5px 15px 0 rgba(37, 44, 97, 0.15) !important;
	}

	&.btn-sm {
		padding: 6px 8px;
	}
}

.btn.btn-primary,
.btn.btn-primary:active:not(:disabled) {
	background-color: #4d61fc;
	color: white;
	border: 2px solid #4d61fc;
}

.btn.btn-secondary,
.btn.btn-secondary:active:not(:disabled) {
	border: 2px solid #4d61fc;
	color: #4d61fc;
	background-color: white;
}
</style>
