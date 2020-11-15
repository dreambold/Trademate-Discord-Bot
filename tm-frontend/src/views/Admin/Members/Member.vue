<template>
	<div>
		<AppCard class="mt-3">
			<h2 class="mb-0">{{ isNew ? 'Add Member' : 'Manage Member' }}</h2>
		</AppCard>

		<ul class="nav nav-tabs mt-3">
			<li class="nav-item">
				<a
					href="#"
					@click="pane = 'details'; $event.preventDefault()"
					class="nav-link"
					:class="{active: pane === 'details'}"
				>Details</a>
			</li>
			<li class="nav-item" v-if="user.permissions.includes('ADMINISTRATOR') || user.rank > 0">
				<a
					href="#"
					@click="pane = 'permissions'; $event.preventDefault()"
					class="nav-link"
					:class="{active: pane === 'permissions'}"
				>Permissions</a>
			</li>
			<li class="nav-item">
				<a
					href="#"
					@click="pane = 'referral-links'; $event.preventDefault()"
					class="nav-link"
					:class="{active: pane === 'referral-links'}"
				>Referral links</a>
			</li>
		</ul>

		<AppCard v-if="pane === 'details'">
			<div v-if="members.loading" class="text-center">
				<AppLoader></AppLoader>
			</div>
			<div v-else>
				<label>Name</label>
				<AppInput v-model="member.name"></AppInput>

				<label>Email</label>
				<AppInput v-model="member.email"></AppInput>

				<label>Discord User ID</label>
				<AppInput v-model="member.discordId"></AppInput>

				<AppButton @click="save">Save</AppButton>
			</div>
		</AppCard>

		<AppCard v-if="pane === 'permissions'">
			<MemberPermissionsEditor :user="member"></MemberPermissionsEditor>
			<AppButton @click="save">Save</AppButton>
		</AppCard>

		<AppCard v-if="pane === 'referral-links'">
			<template v-if="!isNew">
				<h2>
					Referral links
					<AppButton
						@click="showReferralLinkModal = true"
						size="sm"
						class="pl-3 pr-3"
						style="float: right;"
					>+</AppButton>
				</h2>

				<div class="mt-2"></div>

				<vue-good-table
					:columns="columns"
					:rows="referralLinks"
					:search-options="{ enabled: true }"
					styleClass="vgt-table condensed"
					:sort-options="{ enabled: true }"
					:pagination-options="{ enabled: true, perPage: 15 }"
				>
					<template slot="table-row" slot-scope="props">
						<span v-if="props.column.field == 'actions'">
							<AppButton size="sm" type="danger" @click="delReferralLink(props.row.id)">—</AppButton>
						</span>
						<span v-else>{{ props.formattedRow[props.column.field] }}</span>
					</template>
				</vue-good-table>
			</template>

			<CreateReferralLinkModal v-if="showReferralLinkModal" :user-id="member.id" @close="closeModal"></CreateReferralLinkModal>
		</AppCard>
	</div>
</template>

<script src="./Member.js"></script>

<style lang="scss" scoped>
.nav-tabs {
	border-bottom: 0;

	.nav-item a {
		border: 0;
		outline: none;
	}
}
</style>
