<template>
	<div class="plan-selector" :class="{ disabled }">
		<div v-if="loading" class="plan-selector-loader">
			<AppLoader></AppLoader>
		</div>
		<div
			class="plan"
			v-for="(plan, i) in plans"
			:key="i"
			@click="$emit('input', plan.id)"
			:class="{ selected: value == plan.id }"
		>
			<div v-if="current || !allowTrial || !plan.dollarTrial">
				<b style="font-size: 1.1em;">{{ plan.name }}</b>
				<template v-if="plan.id === current">
					&nbsp;
					<small>Current plan</small>
				</template>
				<br />
				<span style="font-size: 0.9em;">${{ Math.ceil(plan.amount / 100 / plan.interval) }}/month</span>
			</div>
			<div v-else>
				<b style="font-size: 1.1em;">{{ plan.name }}</b>
				${{ Math.ceil(plan.amount / 100 / plan.interval) }}/month
				<br />
				<b>$1 trial</b>&nbsp;
				<span style="font-size: 0.9em;">for your first week</span>
			</div>
			<div class="ml-auto">
				<input type="checkbox" @click="$emit('input', plan.id)" :checked="value == plan.id" />
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
		plans: {
			default: () => []
		},

		current: String,

		allowTrial: {
			type: Boolean,
			default: false
		},

		/**
		 * The currently selected plan identifier
		 */
		value: {
			type: String
		},

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
		if (!this.value && this.plans.length > 0) {
			this.$emit('input', this.plans[0].id)
		}
	},

	watch: {
		plans(ps) {
			if (!ps.some(p => p.id === this.value) && this.plans.length > 0) {
				this.$emit('input', this.plans[0].id)
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

			b {
				color: #4d61fc;
			}

			b:last-of-type:not(:first-of-type) {
				color: #4d61fc;
				border-bottom: 2px solid #4d61fc;
				display: inline-block;
				font-size: 0.9em;
			}
		}

		input[type='checkbox'] {
			transform: translateY(3px);
		}
	}
}
</style>
