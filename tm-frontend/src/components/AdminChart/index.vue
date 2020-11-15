<template>
	<div class="mt-4">
		<h4>{{ title }}</h4>
		<RealAdminChart
			v-if="plottingData"
			:style="{position: 'relative', height: '300px'}"
			:data="plottingData"
			:round-date="roundDate"
			:colors="colors"
			:color-background="colorBackground"
			:begin-at-zero="beginAtZero"
		></RealAdminChart>
	</div>
</template>

<script src="./index.js"></script>
