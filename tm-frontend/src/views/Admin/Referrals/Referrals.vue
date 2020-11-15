<template>
	<div>
		<AppCard class="mt-3">
			<h2>Referrals</h2>

			<p>List of active referral links. To create a new link, please visit the page of a user from the members list.</p>

			<vue-good-table
				:columns="columns"
				:rows="referralLinks.v"
				:search-options="{ enabled: true }"
				styleClass="vgt-table condensed"
				:sort-options="{ enabled: true }"
				:pagination-options="{ enabled: true, perPage: 10 }"
			>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'actions'">
						<AppButton
							size="sm"
							@click="$router.push('/admin/members/' + props.row.user.id)"
							class="ml-2"
						>Member</AppButton>
						<!--<AppButton
							size="sm"
							@click="$router.push('/admin/referrals/' + props.row.id)"
							class="ml-2"
						>Details</AppButton>-->
					</span>
					<span v-else-if="props.column.field == 'name'">{{ props.row.user.name }}</span>
					<span v-else-if="props.column.field == 'discord'">
						<template
							v-if="props.row.user.discordAccount"
						>{{ props.row.user.discordAccount.username }}#{{ props.row.user.discordAccount.discriminator }}</template>
					</span>
					<span v-else>{{props.formattedRow[props.column.field]}}</span>
				</template>
			</vue-good-table>
		</AppCard>
	</div>
</template>

<script src="./Referrals.js"></script>
