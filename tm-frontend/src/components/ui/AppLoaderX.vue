<template>
	<div class="LoadingCircle" :class="['LoadingCircle-' + variant]"></div>
</template>

<script>
export default {
	props: {
		variant: {
			type: String,
			default: 'dark'
		}
	}
}
</script>

<style lang="scss" scoped>
.LoadingCircle {
	display: block;
	height: 19px;
	width: 19px;
	border: 4px #888 solid;
	border-top: 4px #ddd solid;
	border-radius: 50%;
	animation: LoadingCircleAnimation 0.8s infinite linear;

	&.LoadingCircle-light {
		border: 4px #bbb solid;
		border-top: 4px #fff solid;
	}
}

@keyframes LoadingCircleAnimation {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(359deg);
	}
}
</style>
