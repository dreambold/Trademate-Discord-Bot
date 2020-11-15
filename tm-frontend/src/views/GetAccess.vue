<template>
	<div class="container">
		<div class="row">
			<div class="col-lg-6 left-column">
				<div class="col-inner">
					<div class="Header mt-3 mb-3">
						<div v-if="step === 1">
							<span class="Title mb-2">{{ APP_VARIANT.name }}</span>
						</div>
						<div v-else>
							<a class="d-block mb-4 ChangePlanLink" @click="step = step - 1">
								❮
								<span class="ml-1">Back</span>
							</a>

							<div
								class="Title mb-2"
							>{{ APP_VARIANT.name }} {{ selectedProduct ? selectedProduct.name : '' }} ({{ selectedPlan.name }})</div>
							<div class="h1 m-0 font-weight-bold">${{ selectedPlan.amount / 100 }}.00</div>

							<div v-if="selectedPlan.dollarTrial">With a $1 trial for one week.</div>
						</div>
						<img src="@/assets/tm-logo.png" alt="Trademate logo" class="FeaturedImage mt-4" />
					</div>

					<div class="mt-4 d-none d-lg-block">
						<a class="SmallLink mr-2" href="https://trademate.net/">Website</a>
						<a class="SmallLink" href="https://trademate.net/tos">Terms</a>
					</div>
				</div>
			</div>
			<div class="col-lg-6 right-column">
				<div class="col-inner" v-if="step === 1 && products.length === 1">
					<span class="Title mb-2">Subscribe</span>

					<span class="Label mb-2">Select subscription</span>
					<PlanSelector :allow-trial="true" :plans="plans" v-model="form.planId" :disabled="disabled"></PlanSelector>

					<AppButton type="primary" class="d-block w-100" @click="step = 2">Continue</AppButton>

					<span class="Title mb-2 mt-4">Login</span>
					<div class="d-flex flex-row align-items-stretch">
						<AppButton type="secondary" class="d-block mr-1 w-100" @click="continueDiscord">With Discord</AppButton>
						<AppButton type="secondary" class="d-block ml-1 w-100" @click="continueEmail">With Email</AppButton>
					</div>

					<div class="mt-4 d-block d-lg-none">
						<a class="SmallLink mr-2" href="https://trademate.net/">Website</a>
						<a class="SmallLink" href="https://trademate.net/tos">Terms</a>
					</div>
				</div>
				<div class="col-inner" v-else-if="step === 1">
					<span class="Title mb-2">Subscribe</span>

					<span class="Label mb-2">Subscription type</span>
					<ASelector :items="products" v-model="selectedProduct">
						<template v-slot:default="{ item }">
							<div>
								<b style="font-size: 1.1em;">{{ item.name }}</b>
							</div>
							<div style="font-size: 0.9em;">{{ item.description }}</div>
						</template>
					</ASelector>

					<span class="Label mb-2">Billing period</span>
					<PlanSelector
						:allow-trial="true"
						:plans="displayPlans"
						v-model="form.planId"
						:disabled="disabled"
					></PlanSelector>

					<AppButton type="primary" class="d-block w-100" @click="step = 2">Continue</AppButton>

					<span class="Title mb-2 mt-4">Login</span>
					<div class="d-flex flex-row align-items-stretch">
						<AppButton type="secondary" class="d-block mr-1 w-100" @click="continueDiscord">With Discord</AppButton>
						<AppButton type="secondary" class="d-block ml-1 w-100" @click="continueEmail">With Email</AppButton>
					</div>

					<div class="mt-4 d-block d-lg-none">
						<a class="SmallLink mr-2" href="https://trademate.net/">Website</a>
						<a class="SmallLink" href="https://trademate.net/tos">Terms</a>
					</div>
				</div>
				<div class="col-inner" v-else-if="step === 2">
					<span class="Title mb-2">Contact information</span>

					<label>Full name</label>
					<AppInput
						v-model="form.name"
						placeholder="John Wick"
						:disabled="disabled"
					>Name that appears on your payment card.</AppInput>

					<label>Email address</label>
					<AppInput
						v-model="form.email"
						placeholder="john.wick@gmail.com"
						:disabled="disabled"
					>You will receive a confirmation email at this address.</AppInput>

					<span class="Title mb-2">Payment method</span>
					<label>Card details</label>
					<div class="stripe-card-container mb-0">
						<StripeCard
							v-if="stripeKey"
							class="stripe-card"
							:class="{ complete: cardValid, disabled }"
							:stripe="stripeKey"
							:options="stripeOptions"
							@change="cardValid = $event.complete"
						></StripeCard>
					</div>

					<img
						src="@/assets/credit_cards_acceptable.png"
						alt="Acceptable Credit Cards (all Stripe payment methods)"
						class="w-100"
					/>

					<AppButton
						type="primary"
						class="d-block w-100 mt-2"
						@click="toStep3"
						:disabled="!formComplete || disabled"
					>Continue</AppButton>
				</div>
				<div class="col-inner" v-else-if="step === 3">
					<template v-if="hasNewsletter">
						<span class="Title mb-2">Newsletter</span>

						<div class="mb-4 mt-2 d-flex">
							<input
								type="checkbox"
								v-model="subscribeNewsletter"
								id="subscribeNewsletterCheckbox"
								class="mr-1"
							/>
							<label
								class="d-inline-block ml-2"
								for="subscribeNewsletterCheckbox"
							>Subscribe to the {{ APP_VARIANT.name }} newsletter</label>
						</div>
					</template>

					<span class="Title mb-2">Terms</span>
					<div class="mb-4 d-flex">
						<input type="checkbox" v-model="tosChecked" id="tosCheckbox" class="mr-1" />
						<label class="ml-2" for="tosCheckbox">
							I've read and accepted the {{ APP_VARIANT.name }}
							<a
								target="_blank"
								href="https://trademate.net/tos"
							>Terms of Service</a>. (required)
						</label>
					</div>

					<div class="text-center">
						<AppButton type="primary" :disabled="true" v-if="!selectedPlan">Pay</AppButton>
						<AppButton
							type="primary"
							:disabled="!formComplete || disabled || !tosChecked"
							@click="pay"
							v-else
						>Subscribe for ${{ selectedPlan.dollarTrial ? 1 : selectedPlan.amount / 100 }}.00 USD</AppButton>
						<br />
						<small class="text-muted d-block mt-2">{{ pricingLine }}</small>
						<small class="text-muted d-block">Renews automatically. Cancel anytime, no refunds.</small>
					</div>
				</div>
			</div>
		</div>

		<EmailLoginModal v-show="showEmailModal" @close="showEmailModal = false"></EmailLoginModal>
	</div>
</template>

<script src="./GetAccess.js"></script>

<style lang="scss" scoped>
.Title {
	color: hsla(0, 0%, 10%, 0.6);
	font-weight: 600;
	font-size: 17px;
	display: block;
}

.Label {
	color: hsla(0, 0%, 10%, 0.7);
	font-weight: 600;
	font-size: 14px;
	display: block;
}

@media screen and (min-width: 992px) {
	.container {
		max-width: 1000px;
		padding: 16px;
		min-height: 100vh;
		display: flex;
	}

	.right-column::before {
		height: 100%;
		width: 50%;
		position: fixed;
		content: ' ';
		top: 0;
		right: 0;
		background: transparent;
		box-shadow: 15px 0 30px 0 rgba(0, 0, 0, 0.18);
		pointer-events: none;
	}

	.row {
		width: 100%;
		min-height: 100%;
		align-items: center;
	}

	.col-lg-6 {
		display: flex;
		align-items: stretch;
	}

	.col-inner {
		width: 380px;
		max-width: 100%;
		margin-left: auto;
	}
}

.SmallLink {
	color: hsla(0, 0%, 10%, 0.7);
	font-size: 15px;

	&:hover {
		text-decoration: none;
	}
}

.FeaturedImage {
	height: 250px;
	width: 250px;
	border-radius: 6px;
	background-color: #000b42;
}

@media screen and (max-width: 991px) {
	.container {
		max-width: 380px;
	}

	.col-inner {
		margin-left: auto;
		margin-right: auto;
	}

	.row {
		margin: 0;
		width: 100%;
	}

	.col-lg-6 {
		padding: 0;
	}

	.Header {
		display: flex;
		align-items: center;

		.Title {
			margin: 0 !important;
		}
	}

	.FeaturedImage {
		height: 41px;
		width: 41px;
		margin-left: auto;
		margin-top: 0 !important;
	}
}

.ChangePlanLink {
	font-size: 15px;
	font-weight: 600;
	cursor: pointer;
}

.stripe-card-container {
	border: 2px solid #d8dde6;
	border-radius: 0.25rem;
	padding: 0.6rem 0.8rem 0.5rem 0.8rem;
	margin-bottom: 1rem;
	transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

	height: calc(1.5em + 1rem + 2px);

	&:hover {
		border-color: #a3afc4;
	}
}
</style>
