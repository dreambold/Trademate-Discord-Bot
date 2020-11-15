<template>
	<AppCard class="discord-card" :class="{ 'has-account': !!account }">
		<template v-if="account">
			<img :src="account.avatarURI" alt="Profile image" class="avatar" />
			<div class="flex-grow-1">
				<label>Discord Username</label>
				<p class="m-0">{{ accountTag }}</p>

				<label class="mt-2" v-if="account.updatedAt">Latest Update</label>
				<p class="m-0" v-if="account.updatedAt">{{ accountUpdateTime }}</p>
			</div>
			<div class="flex-shrink-0 mb-auto" v-if="account.updatedAt">
				<AppButton size="sm" @click="updateAccount">Update</AppButton>
			</div>
		</template>
		<template v-else>
			<div class="flex-grow-1 mr-4">
				<b>You are not logged in with Discord!</b> You should log in now in
				order to access member channels.
			</div>
			<div class="flex-shrink-0">
				<AppButton size="sm" @click="updateAccount">Add Account</AppButton>
			</div>
		</template>
	</AppCard>
</template>

<script>
import AppCard from './ui/AppCard.vue'
import AppButton from './ui/AppButton.vue'

import { formatDate } from '../utils'

export default {
	props: {
		account: {}
	},

	components: {
		AppCard,
		AppButton
	},

	computed: {
		accountTag() {
			if (!this.account) return

			return this.account.username + '#' + this.account.discriminator
		},

		accountUpdateTime() {
			if (!this.account || !this.account.updatedAt) return

			return formatDate(this.account.updatedAt)
		}
	},

	methods: {
		updateAccount() {
			window.location.assign(this.$store.state.urls.api + '/auth/discord')
		}
	}
}
</script>

<style lang="scss" scoped>
.discord-card {
	background-color: #36393f;
	color: white;

	display: flex;
	flex-direction: row;
	align-items: center;

	.avatar {
		height: 90px;
		width: 90px;
		border-radius: 50%;
		margin-right: 25px;
		align-self: center;
	}

	label {
		opacity: 0.6;
		margin-bottom: -2px;
	}

	&:not(.has-account) {
		align-items: center;
	}
}
</style>
