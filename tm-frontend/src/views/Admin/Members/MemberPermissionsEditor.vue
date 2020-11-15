<template>
	<div class="row">
		<div class="col-lg-6 mb-2" v-for="(perm, i) in permissionDetails" :key="i">
			<input
				type="checkbox"
				:checked="user.permissions.includes(perm.key)"
				@click="togglePermission(perm.key)"
				class="mr-2"
				:id="'perm_' + perm.key"
			/>
			<label class="d-inline font-weight-normal" :for="'perm_' + perm.key">{{ perm.label }}</label>
		</div>
	</div>
</template>

<script>
export default {
	props: ['user'],

	methods: {
		togglePermission(perm) {
			let p = this.user.permissions
			if (!p.includes(perm)) p.push(perm)
			else p.splice(p.indexOf(perm), 1)
		}
	},

	data() {
		const adminPermission =
			this.user?.rank > 0
				? [
						{
							key: 'ADMINISTRATOR',
							label: 'Administrator'
						}
				  ]
				: []

		return {
			permissionDetails: [
				...adminPermission,
				{
					key: 'VIEW_DASHBOARD',
					label: 'View dashboard'
				},
				{
					key: 'VIEW_USERS',
					label: 'View users'
				},
				{
					key: 'EDIT_USERS',
					label: 'Edit users'
				},

				{
					key: 'VIEW_TRIALS',
					label: 'View trials'
				},
				{
					key: 'VIEW_REFERRALS',
					label: 'View referrals'
				},
				{
					key: 'EDIT_REFERRALS',
					label: 'Edit referrals'
				},
				{
					key: 'VIEW_POLLS',
					label: 'View polls'
				},
				{
					key: 'EDIT_POLLS',
					label: 'Edit polls'
				},
				{
					key: 'VIEW_MESSAGES',
					label: 'View messages'
				},
				{
					key: 'EDIT_MESSAGES',
					label: 'Edit messages'
				},
				{
					key: 'VIEW_STATISTICS',
					label: 'View statistics'
				},
				{
					key: 'VIEW_RANKS',
					label: 'View ranks'
				},
				{
					key: 'EDIT_RANKS',
					label: 'Edit ranks'
				},
				{
					key: 'VIEW_SHOP',
					label: 'View shop'
				},
				{
					key: 'EDIT_SHOP',
					label: 'Edit shop'
				}
			]
		}
	}
}
</script>
