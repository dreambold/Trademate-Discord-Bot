<template>
	<div>
		<div v-if="!item" class="d-flex justify-content-center my-3">
			<AppLoaderX></AppLoaderX>
		</div>
		<div v-else>
			<label>Item name</label>
			<AppInput v-model="item.name" :disabled="saving"></AppInput>

			<label>Item description</label>
			<AppInput v-model="item.description" type="textarea" :disabled="saving"></AppInput>

			<label>Item price (XP)</label>
			<AppInput v-model.number="item.price" type="number" :disabled="!!item.id || saving" class="mb-0"></AppInput>
			<div
				class="text-muted mb-3"
			>It will take on average {{ averageMessageCountForPrice }} messages for someone to earn enough XP to buy this item. Cannot be changed once an item is created.</div>

			<label>Item type</label>
			<select class="w-100" v-model="item.type" :disabled="!!item.id || saving">
				<option value="manual">Manual</option>
				<option value="discord-roles">Discord role(s)</option>
				<option value="membership-extension">Membership extension</option>
			</select>

			<div v-if="item.type === 'discord-roles'" class="ItemTypeSettingsContainer">
				<label>Discord role(s)</label>
				<VMultiselect
					track-by="id"
					label="name"
					v-model="selectedRoles"
					:options="discordRoles.v"
					:multiple="true"
					:disabled="!!item.id || saving"
				></VMultiselect>
			</div>
			<div v-else-if="item.type === 'membership-extension'" class="ItemTypeSettingsContainer">
				<label>Membership extension length (in months)</label>
				<AppInput
					v-model.number="item.data.length"
					type="number"
					class="mb-0"
					:disabled="!!item.id || saving"
				></AppInput>
			</div>

			<div class="text-muted">
				<template
					v-if="item.type === 'manual'"
				>Item type cannot be changed once an item has been created.</template>
				<template v-else>Item type and settings cannot be changed once an item has been created.</template>
			</div>

			<div v-if="item.id" class="mt-3">
				<label>Archived item</label>
				<input type="checkbox" v-model="item.archived" /> Archived
				<div
					class="text-muted"
				>An archived item will not be displayed in the user shop, and no one will be able to buy it.</div>
			</div>

			<AppButton class="mt-3" :disabled="!itemValid" :loading="saving" @click="save">Save</AppButton>
		</div>
	</div>
</template>

<script>
import * as api from '../../../api'
import { mapState } from 'vuex'

export default {
	data() {
		return {
			EMPTY_ITEM: {
				name: '',
				description: '',
				type: 'manual',
				price: 10000,
				archived: false,
				data: {}
			},
			selectedRoles: [],
			item: null,
			saving: false
		}
	},

	async created() {
		if (!this.items.loaded)
			await this.$store.dispatch('admin/fetchResource', { name: 'shopItems' })

		if (!this.discordRoles.loaded)
			await this.$store.dispatch('admin/loadDiscordRoles')

		this.reloadItem()
	},

	methods: {
		reloadItem() {
			if (this.itemId === 'new') {
				this.item = this.$jsonCopy(this.EMPTY_ITEM)
			} else {
				let item =
					this.items.v.length &&
					this.items.v.find(item => item.id === parseInt(this.itemId))

				if (item) item = this.$jsonCopy(item)
				this.item = item
			}

			// Load Discord roles into state for VueMultiselect
			if (this.item && this.item.type === 'discord-roles')
				this.selectedRoles = this.item.data?.roles?.map(r =>
					this.discordRoles.v.find(role => role.id === r)
				)

			if (!this.item) {
				this.$notify({
					type: 'error',
					text: 'Could not find shop item to edit.'
				})
				this.$router.push('/admin/shop/items')
			}
		},

		save() {
			this.saving = true

			if (!this.item.id && this.item.type === 'discord-roles')
				this.item.data.roles = this.selectedRoles.map(r => r.id)

			api
				.post('admin/shop/items', this.item)
				.then(async data => {
					await this.$store.dispatch('admin/fetchResource', {
						name: 'shopItems'
					})

					if (this.item.id) this.reloadItem()

					if (this.item.id !== data.item.id) {
						this.$router.push('/admin/shop/items/' + data.item.id)
					}
				})
				.finally(() => {
					this.saving = false
				})
		}
	},

	watch: {
		itemId(v, v2) {
			if (v !== v2) this.reloadItem()
		},

		'item.type'(v) {
			if (this.item.id) return

			if (v === 'manual') this.item.data = {}
			else if (v === 'discord-roles') this.item.data = { roles: [] }
			else if (v === 'membership-extension') this.item.data = { length: 1 }
		}
	},

	computed: {
		...mapState({
			items: s => s.admin.shopItems,
			discordRoles: s => s.admin.discordRoles
		}),

		itemId() {
			return this.$route.params.id
		},

		itemValid() {
			const i = this.item

			return (
				i.name.length > 2 &&
				i.price > 0 &&
				(i.type !== 'membership-extension' || i.data.length > 0)
			)
		},

		averageMessageCountForPrice() {
			return Math.ceil(this.item.price / 27.5)
		}
	}
}
</script>

<style lang="scss" scoped>
.ItemTypeSettingsContainer {
	border-left: 5px solid rgba(0, 0, 0, 0.1);
	margin-top: 6px;
	padding-left: 8px;
}
</style>
