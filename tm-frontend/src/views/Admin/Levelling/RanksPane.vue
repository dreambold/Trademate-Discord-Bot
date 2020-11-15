<template>
	<div>
		<div v-if="ranks && discordRoles.loaded">
			<vue-good-table
				:columns="columns"
				:rows="ranks"
				:sort-options="{ enabled: true, initialSortBy: {field: 'levelRequired', type: 'asc'} }"
			>
				<div slot="emptystate" class="d-flex align-items-center">No ranks added.</div>
				<template slot="table-row" slot-scope="props">
					<span v-if="props.column.field == 'actions'">
						<AppButton size="sm" class="mr-2" @click="editRank(props.row.originalIndex)">Edit</AppButton>
						<AppButton size="sm" type="danger" @click="removeRank(props.row.originalIndex)">
							<i class="fas fa-minus"></i>
						</AppButton>
					</span>
					<span v-else>{{ props.formattedRow[props.column.field] }}</span>
				</template>
			</vue-good-table>

			<div class="d-flex">
				<AppButton class="mt-3" :disabled="!ranksValid" @click="saveRanks">Save</AppButton>
				<AppButton class="mt-3 ml-auto" type="secondary" @click="createRank">
					Add Rank
					<i class="fas fa-plus ml-1"></i>
				</AppButton>
			</div>
		</div>
		<div v-else class="d-flex justify-content-center mt-2 mb-2">
			<AppLoaderX></AppLoaderX>
		</div>

		<RankEditorModal v-model="editingRank" v-if="!!editingRank" @close="editingRank = null"></RankEditorModal>
	</div>
</template>

<script>
import * as api from '../../../api'
import RankEditorModal from './RankEditorModal.vue'
import { mapState } from 'vuex'

export default {
	components: { RankEditorModal },

	data() {
		return {
			ranks: null,
			editingRank: null,
			columns: [
				{
					label: 'Name',
					field: 'name',
					sortable: false
				},
				{
					label: 'Level Required',
					field: 'levelRequired',
					type: 'number'
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
		this.loadRanks()
		this.$store.dispatch('admin/loadDiscordRoles')
	},

	computed: {
		ranksValid() {
			return this.ranks.every(
				r => r.name.length > 2 && r.levelRequired > 0 && r.levelRequired < 101
			)
		},

		...mapState({
			discordRoles: s => s.admin.discordRoles
		})
	},

	methods: {
		async loadRanks() {
			this.ranks = (await api.get('admin/ranks')).ranks
		},

		async saveRanks() {
			this.ranks = (await api.post('admin/ranks', this.ranks)).ranks
		},

		createRank() {
			const rank = {
				id: null,
				name: '',
				levelRequired: 10,
				rewardsDescription: '',
				discordRoleRewardsIds: []
			}

			this.ranks.push(rank)
			this.editingRank = rank
		},

		removeRank(i) {
			this.ranks.splice(i, 1)
		},

		editRank(i) {
			this.editingRank = this.ranks[i]
		}
	}
}
</script>
