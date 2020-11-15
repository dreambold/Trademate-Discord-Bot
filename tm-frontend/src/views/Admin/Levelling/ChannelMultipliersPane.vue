<template>
	<div>
		<div
			v-if="multipliers === null || !discordChannels.loaded"
			class="d-flex justify-content-center mt-2 mb-2"
		>
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<vue-good-table :columns="columns" :rows="multipliers">
				<div slot="emptystate" class="d-flex align-items-center">No channel bonuses added.</div>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'actions'">
						<AppButton size="sm" type="danger" @click="removeMultiplier(props.row.originalIndex)">
							<i class="fas fa-minus"></i>
						</AppButton>
					</span>
					<span
						v-else-if="props.column.field == 'channel'"
					>{{ channelIDToName(props.row.discordChannelId) }}</span>
					<span v-else-if="props.column.field == 'initialMultiplier'">
						<AppInput
							class="mb-0"
							v-model.number="multipliers[props.row.originalIndex].initialMultiplier"
							type="number"
							step=".01"
						></AppInput>
					</span>
					<span v-else-if="props.column.field == 'multiplier'">
						<AppInput
							class="mb-0"
							v-model.number="multipliers[props.row.originalIndex].multiplier"
							type="number"
							step=".01"
						></AppInput>
					</span>
					<span v-else>{{ props.formattedRow[props.column.field] }}</span>
				</template>
			</vue-good-table>

			<div class="d-flex align-items-center mt-3">
				<AppButton :disabled="!multipliersValid" @click="saveMultipliers">Save</AppButton>
				<div class="ml-auto">
					<VMultiselect
						track-by="id"
						label="name"
						style="width: 250px;"
						v-model="selectedChannel"
						:options="selectableDiscordChannels"
					></VMultiselect>
				</div>
				<AppButton class="ml-2" type="secondary" @click="addMultiplier" :disabled="!selectedChannel">
					Customize
					<i class="fas fa-plus ml-1"></i>
				</AppButton>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import * as api from '../../../api'

export default {
	name: 'ChannelMultipliersPane',

	data() {
		return {
			multipliers: null,
			selectedChannel: null,
			columns: [
				{
					label: 'Channel',
					field: 'channel',
					sortable: false
				},
				{
					label: 'First Message Bonus (multiplier)',
					field: 'initialMultiplier'
				},
				{
					label: 'Bonus (multiplier)',
					field: 'multiplier'
				},
				{
					label: 'Actions',
					field: 'actions',
					sortable: false
				}
			]
		}
	},

	created() {
		this.loadMultipliers()
		this.$store.dispatch('admin/loadDiscordChannels')
	},

	computed: {
		...mapState({
			discordChannels: s => s.admin.discordChannels
		}),

		multipliersValid() {
			return this.multipliers.every(
				m =>
					isFinite(m.multiplier) &&
					m.multiplier >= 0 &&
					isFinite(m.initialMultiplier) &&
					m.initialMultiplier >= 0
			)
		},

		selectableDiscordChannels() {
			return this.discordChannels.v.filter(
				ch =>
					ch.type === 'text' &&
					!this.multipliers.find(m => m.discordChannelId === ch.id)
			)
		}
	},

	methods: {
		async loadMultipliers() {
			this.multipliers = (
				await api.get('admin/levelling-multipliers')
			).channelsSettings
		},

		async saveMultipliers() {
			this.multipliers = (
				await api.post('admin/levelling-multipliers', this.multipliers)
			).channelsSettings
		},

		channelIDToName(id) {
			const channel = this.discordChannels.v?.find(c => c.id === id)

			return channel ? '#' + channel.name : id
		},

		addMultiplier() {
			if (!this.selectedChannel) return

			this.multipliers.push({
				discordChannelId: this.selectedChannel.id,
				initialMultiplier: 1,
				multiplier: 1
			})

			this.selectedChannel = null
		},

		removeMultiplier(i) {
			this.multipliers.splice(i, 1)
		}
	}
}
</script>

<style lang="scss" scoped>
</style>
