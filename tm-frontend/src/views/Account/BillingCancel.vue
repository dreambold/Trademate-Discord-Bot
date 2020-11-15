<template>
	<AppCard>
		<h3>Get 50% off for one month!</h3>
		<p>Please respond to the following poll in order to get 50% off the next month of your subscription, given it does not change. If you still would like to cancel, please click the "cancel anyway" button at the bottom of this page after filling in the poll.</p>

		<div v-if="loading || !flow" class="text-center">
			<AppLoader></AppLoader>
		</div>
		<div v-else class="mb-3">
			<FlowRenderer v-model="flowCompleted" :flow="flow"></FlowRenderer>
		</div>

		<AppButton
			class="mr-2"
			:disabled="!flow || loading || saving || !flowCompleted"
			@click="doDiscount"
		>GET 50% OFF</AppButton>
		<AppButton
			type="danger"
			:disabled="!flow || loading || saving || !flowCompleted"
			@click="doCancel"
		>Cancel anyway</AppButton>
	</AppCard>
</template> 

<script src="./BillingCancel.js"></script>
