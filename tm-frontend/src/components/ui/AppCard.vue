<template>
	<div class="c-card" :class="{ fluid, ['c-card-' + type]: true }">
		<slot></slot>
	</div>
</template>

<script>
export default {
	props: {
		fluid: {
			type: Boolean,
			default: false
		},

		type: {
			type: String,
			default: 'default'
		}
	}
}
</script>

<style lang="scss">
.c-card {
	border-radius: 5px;
	background-color: white;
	padding: 12px 17px;

	border: none;

	-webkit-box-shadow: 0 1px 20px 0 rgba(69, 90, 100, 0.08);
	box-shadow: 0 1px 20px 0 rgba(69, 90, 100, 0.08);

	&.fluid {
		padding: 0;
	}

	&.c-card-error {
		background-color: rgba(#dc3545, 0.7) !important;
		color: white;
	}

	&.c-card-success {
		background-color: rgba(#23af85, 0.7) !important;
		color: white;
	}

	&.c-card-darker {
		-webkit-box-shadow: 0 1px 20px 0 rgba(69, 90, 100, 0.12);
		box-shadow: 0 1px 20px 0 rgba(69, 90, 100, 0.12);
		background-color: rgba(0, 0, 0, 0.1) !important;
	}
}
</style>
