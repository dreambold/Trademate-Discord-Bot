<template>
	<div class="plan-selector" :class="{ disabled }">
		<div v-if="loading" class="plan-selector-loader">
			<AppLoader></AppLoader>
		</div>
		<div
			class="plan"
			v-for="(item, i) in items"
			:key="i"
			@click="$emit('input', item)"
			:class="{ selected: item == value }"
		>
			<div>
				<slot v-bind:item="item"></slot>
			</div>
			<div class="ml-auto pl-1">
				<input type="checkbox" @click="$emit('input', item)" :checked="value == item" />
			</div>
		</div>
	</div>
</template>

<script>
import AppLoader from './ui/AppLoader.vue'

export default {
	components: {
		AppLoader
	},

	props: {
		items: {
			default: () => []
		},

		/**
		 * The currently selected plan identifier
		 */
		value: {},

		disabled: {
			type: Boolean,
			default: false
		},

		loading: {
			type: Boolean,
			default: false
		}
	},

	created() {
		if (!this.value && this.items.length > 0) {
			this.$emit('input', this.items[0].id)
		}
	},

	watch: {
		items() {
			if (!this.value && this.items.length > 0) {
				this.$emit('input', this.items[0].id)
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.plan-selector {
	display: flex;
	flex-direction: column;
	user-select: none;
	cursor: pointer;

	border: 3px solid #f0f0f0;
	color: #555;

	border-radius: 5px;
	margin-bottom: 1rem;

	overflow: hidden;

	&.disabled {
		background-color: #eee;
		pointer-events: none;
	}

	.plan {
		padding: 10px 15px;
		// flex: 1 0 0;
		// text-align: center;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		position: relative;
		transition: background-color 0.1s;

		b {
			transition: color 0.1s;
		}

		&.selected {
			background-color: #f0f0f0;

			b:first-child {
				color: #4d61fc;
			}
		}

		input[type='checkbox'] {
			transform: translateY(3px);
		}
	}
}
</style>
