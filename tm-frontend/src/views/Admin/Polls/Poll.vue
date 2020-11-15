<template>
	<div>
		<AppCard class="mt-3">
			<h2>Poll</h2>

			<div v-if="flows.loading" class="text-center">
				<AppLoader></AppLoader>
			</div>
			<div v-else>
				<p v-if="rawFlow.system">
					<span class="badge badge-secondary d-inline-block mr-1">System</span> This is a system poll, and as such the
					name/description cannot be edited. Please never create another
					poll with the same name as a system poll.
				</p>
				<p v-if="rawFlow.webSafe">
					<span class="badge badge-secondary d-inline-block mr-1">WebSafe</span> This poll is used on the website, and as such only supports text prompts.
				</p>

				<label>Name</label>
				<AppInput v-model="flow.name" :disabled="rawFlow.system"></AppInput>

				<label>Description</label>
				<AppInput v-model="flow.description" :disabled="rawFlow.system"></AppInput>

				<label>Block editor</label>
				<FlowEditor v-model="flow"></FlowEditor>

				<div class="d-flex align-items-center mt-3">
					<AppButton @click="save">Save</AppButton>
					<div class="ml-3">
						Archived:
						<input type="checkbox" :disabled="flow.system" v-model="flow.archived" />
					</div>
					<AppButton
						@click="showSendPrompt = true"
						:disabled="!canSend"
						type="warning"
						class="ml-auto"
					>Send poll</AppButton>
				</div>

				<template v-if="flow.id">
					<h3 class="mt-4">Automated sending</h3>

					<div class="form-check">
						<input type="checkbox" class="form-check-input" v-model="flow.autoSendEnabled" />
						<label class="form-check-label ml-1">Enable</label>
					</div>

					<div class="mt-2">
						Send every
						<input type="number" v-model="flow.autoSendHours" /> hours, to
						<input type="number" v-model="flow.autoSendCount" /> people of the
						<select v-model="flow.autoSendAudience">
							<option value="members">Members</option>
							<option value="non-members">Non-members</option>
							<option value="trials">Trials</option>
							<option value="all">Everyone</option>
						</select> audience.
					</div>

					<AppButton @click="save" class="mt-3" size="sm">Save</AppButton>
				</template>
			</div>
		</AppCard>

		<SendPollModal v-show="showSendPrompt" :flow="rawFlow" @close="showSendPrompt = false"></SendPollModal>
	</div>
</template>

<script src="./Poll.js"></script>
