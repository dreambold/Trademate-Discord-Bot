<template>
	<div id="app" :class="['variant-' + APP_VARIANT.slug]">
		<notifications position="top center" classes="vue-notification notification"></notifications>

		<RouterView></RouterView>
	</div>
</template>

<script>
export default {
	created() {
		this.$store.dispatch('fetchData')
	}
}
</script>

<style lang="scss">
@import 'style/variables';

html,
body {
	margin: 0;
	font-size: 16px;

	background-color: #fff;
	font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
		'Segoe UI Symbol';
	color: #3d3d3d;

	-webkit-font-smoothing: antialiased;
}

h1 {
	font-weight: 700;
	font-size: 48px;
}

label {
	font-weight: bold;
	display: block;
	margin-bottom: 2px;
}

:root .notification {
	background-color: $primary-color;
	border: 0;
	margin: 5px 5px 0 5px;
	border-radius: 5px;
}

.vgt-table td {
	vertical-align: middle !important;
}

.table-action-column {
	width: 1px;
	white-space: nowrap;
}
</style>
