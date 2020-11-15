<template>
	<div class="container">
		<div class="d-flex align-items-center my-4">
			<img src="@/assets/tm-logo.png" alt="Trademate logo" class="Logo" />
			<h1 class="ml-4 mb-0">Trademate Ranks</h1>
		</div>

		<div v-if="userRank">
			<h2 class="font-weight-bold">Your rank</h2>
			<AppCard type="darker" class="mb-4">
				<div class="d-flex align-items-center UserLine">
					<div class="d-flex align-items-center">
						<div class="PositionNumber">{{ userRank.position }}</div>
						<div>
							<img
								class="ProfilePicture"
								:src="userRank.discordAccount.avatarURI"
								:alt="userRank.discordAccount.username + '\'s profile picture'"
							/>
						</div>

						<div
							class="Username"
						>{{ userRank.discordAccount.username }}#{{ userRank.discordAccount.discriminator }}</div>
					</div>
					<div class="ml-auto d-flex align-items-center StatColumns">
						<div class="StatColumn">
							<div class="text-muted">Messages</div>
							<div>{{ formatNumber(userRank.messageCount) }}</div>
						</div>
						<div class="StatColumn">
							<div class="text-muted">Experience</div>
							<div>{{ formatNumber(userRank.xp) }}</div>
						</div>
						<div class="StatColumn">
							<div class="text-muted">Level</div>
							<div>{{ userRank.level }}</div>
						</div>
					</div>
				</div>
			</AppCard>

			<h2 class="font-weight-bold">Global ranks</h2>
		</div>

		<AppCard type="darker">
			<div class="d-flex justify-content-center my-3" v-if="ranks === null">
				<AppLoaderX></AppLoaderX>
			</div>
			<div v-else>
				<div class="d-flex align-items-center UserLine" v-for="(rank, i) in ranks" :key="i">
					<div class="d-flex align-items-center">
						<div class="PositionNumber">{{ rank.position }}</div>
						<div>
							<img
								class="ProfilePicture"
								:src="rank.discordAccount.avatarURI"
								:alt="rank.discordAccount.username + '\'s profile picture'"
							/>
						</div>

						<div
							class="Username"
						>{{ rank.discordAccount.username }}#{{ rank.discordAccount.discriminator }}</div>
					</div>
					<div class="ml-auto d-flex align-items-center StatColumns">
						<div class="StatColumn">
							<div class="text-muted">Messages</div>
							<div>{{ formatNumber(rank.messageCount) }}</div>
						</div>
						<div class="StatColumn">
							<div class="text-muted">Experience</div>
							<div>{{ formatNumber(rank.xp) }}</div>
						</div>
						<div class="StatColumn">
							<div class="text-muted">Level</div>
							<div>{{ rank.level }}</div>
						</div>
					</div>
				</div>
			</div>
		</AppCard>
	</div>
</template>

<script>
import * as api from '../api'

export default {
	name: 'Ranks',
	data() {
		return {
			ranks: null,
			userRank: null
		}
	},

	created() {
		this.loadRanks()
	},

	methods: {
		async loadRanks() {
			const data = await api.get('ranks')
			this.ranks = data.topRanks
			this.userRank = data.userRank
		},

		formatNumber(n) {
			return n < 1000 ? n : (n / 1000).toFixed(1) + 'k'
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	max-width: 900px;
}

.Logo {
	height: 85px;
	background-color: #000b42;
	display: block;
	border-radius: 20px;
}

.PositionNumber {
	background-color: #00000055;
	color: white;
	font-weight: bold;
	border-radius: 50%;
	height: 30px;
	width: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	flex-grow: 0;
}

.ProfilePicture {
	border-radius: 50%;
	height: 65px;
	width: 65px;
	margin-left: 15px;
	margin-right: 15px;
}

.Username {
	font-weight: bold;
	font-size: 20px;
}

.StatColumn {
	margin-left: 15px;
	width: 90px;
	text-align: center;

	div:first-child {
		text-transform: uppercase;
		font-size: 14px;
	}

	div:last-child {
		font-weight: bold;
	}
}

.UserLine {
	margin-bottom: 7px;
	padding-bottom: 7px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);

	&:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border: 0;
	}
}

@media screen and (max-width: 600px) {
	.UserLine {
		flex-direction: column;

		& > div {
			width: 100%;
		}

		& > div:first-child {
			margin-bottom: 10px;
		}

		& > div:last-child {
			align-items: center;
			justify-content: center;
		}
	}
}
</style>
