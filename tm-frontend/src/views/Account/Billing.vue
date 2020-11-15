<template>
	<div>
		<AppCard class="mb-3">
			<h3 class="m-0">Billing</h3>
		</AppCard>

		<AppCard v-if="popMessage" :type="popMessage.type" class="mb-3">{{ popMessage.text }}</AppCard>
		<AppCard
			v-if="isLegacyPlan"
			type="warning"
			class="mb-3"
		>You are currently on a legacy plan and will be billed ${{ subscription.plan.amount / 100 }} USD every {{ subscription.plan.interval }} month(s).</AppCard>

		<AppCard class="mb-3">
			<div v-if="!loaded" class="text-center">
				<AppLoader></AppLoader>
			</div>
			<div v-else>
				<label>Subscription</label>
				<span class="Label mb-2" v-if="products.length > 0">Subscription type</span>
				<ASelector v-if="products.length > 0" :items="products" v-model="selectedProduct">
					<template v-slot:default="{ item }">
						<div>
							<b style="font-size: 1.1em;">{{ item.name }}</b>
						</div>
						<div>{{ item.description }}</div>
					</template>
				</ASelector>

				<span class="Label mb-2">Billing period</span>
				<PlanSelector
					:allow-trial="false"
					:plans="displayPlans"
					v-model="form.planId"
					:current="this.subscription && this.subscription.planId || ''"
					:disabled="loading"
				></PlanSelector>

				<div class="sub-update-container">
					<AppButton size="sm" :disabled="loading || !canSavePlan" @click="savePlan">Update</AppButton>
					<small class="text-muted">You will be charged right away, with proration taken into account.</small>
				</div>

				<!-- ---------- -->
				<hr />

				<label class="mt-3">Change payment details</label>

				<div class="stripe-card-container mb-2">
					<StripeCard
						v-if="stripeKey"
						class="stripe-card"
						:class="{ complete: cardValid, disabled: loading }"
						:stripe="stripeKey"
						:options="{}"
						@change="cardValid = $event.complete"
					></StripeCard>
				</div>

				<div class="sub-update-container">
					<AppButton size="sm" :disabled="loading || !cardValid" @click="saveCard">Update</AppButton>
					<small class="text-muted">Any pending invoices will automatically be charged for.</small>
				</div>
			</div>
		</AppCard>

		<AppCard v-if="subscription && subscription.setUp">
			<AppButton size="sm" type="danger" @click="showCancelModal = true">Cancel subscription</AppButton>
		</AppCard>

		<CancelSubscriptionModal v-show="showCancelModal" @close="cancelModalClosed"></CancelSubscriptionModal>
	</div>
</template>

<script src="./Billing.js"></script>

<style lang="scss" scoped>
.sub-update-container {
	display: flex;
	flex-direction: row;

	align-items: center;

	small {
		display: block;
		margin-left: 8px;
		flex-grow: 1;
	}
}

.stripe-card-container {
	border: 2px solid #d8dde6;
	border-radius: 0.25rem;
	padding: 0.5rem 0.8rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	background-color: white;

	height: calc(1.5em + 1rem + 2px);

	&:hover {
		border-color: #a3afc4;
	}
}

::v-deep .plan-selector {
	background-color: white;
}

::v-deep .plan-selector .plan.selected {
	background-color: rgba(0, 0, 0, 0.028);
}
</style>
