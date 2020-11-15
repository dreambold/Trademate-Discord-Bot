<template>
	<AppModal @close="close">
		<div class="p-4">
			<label>Name</label>
			<AppInput v-model.trim="value.name"></AppInput>

			<label>Level required</label>
			<AppInput type="number" v-model.number="value.levelRequired"></AppInput>

			<label>Description of rewards</label>
			<AppInput type="textarea" v-model.number="value.rewardsDescription"></AppInput>

			<label>Discord role rewards</label>
			<div class="mb-4">
				<VMultiselect
					track-by="id"
					label="name"
					v-model="selectedRoles"
					:options="discordRoles.v"
					:multiple="true"
				></VMultiselect>
			</div>

			<AppButton type="secondary" size="sm" class="w-100" @click="close">Close</AppButton>
		</div>
	</AppModal>
</template>

<script>
import AppModal from '../../../components/modals/AppModal'
import { mapState } from 'vuex'

export default {
	components: {
		AppModal
	},

	props: ['value'],

	data() {
		return {
			selectedRoles: []
		}
	},

	created() {
		this.selectedRoles = this.discordRoles.v.filter(r =>
			this.value.discordRoleRewardsIds.includes(r.id)
		)
	},

	methods: {
		close() {
			this.value.discordRoleRewardsIds = this.selectedRoles.map(r => r.id)

			this.$emit('close')
		}
	},

	computed: {
		...mapState({
			discordRoles: s => s.admin.discordRoles
		})
	}
}
</script>
