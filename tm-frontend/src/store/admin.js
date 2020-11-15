import * as api from '../api'

const resourceFetchInformation = {
	shopOrders: {
		get: 'admin/shop/orders',
		getKey: 'orders'
	},
	shopItems: {
		get: 'admin/shop/items',
		getKey: 'items'
	}
}

export const adminStore = {
	namespaced: true,

	state: {
		statistics: {
			loading: false,
			v: {}
		},

		templates: {
			loading: false,
			v: {}
		},

		...[
			'discordRoles',
			'discordChannels',
			'flows',
			'flowResponses',
			'referralLinks',
			'referrals',
			'trials',
			'members',
			'shopOrders',
			'shopItems'
		].reduce((prev, curr) => {
			prev[curr] = {
				loading: false,
				loaded: false,
				v: []
			}
			return prev
		}, {})
	},

	mutations: {
		membersLoaded(state, members) {
			state.members.v = members
			state.members.loading = false
		},

		trialsLoaded(state, trials) {
			state.trials.v = trials
			state.trials.loading = false
		},

		statisticsLoaded(state, statistics) {
			state.statistics.v = statistics
			state.statistics.loading = false
		},

		templatesLoaded(state, templates) {
			state.templates.v = templates
			state.templates.loading = false
		},

		flowsLoaded(state, flows) {
			state.flows.v = flows
			state.flows.loading = false
		},

		flowResponsesLoaded(state, data) {
			state.flowResponses.v = data.entries
			state.flowResponses.ongoingCount = data.ongoingCount
			state.flowResponses.loading = false
		},

		setLoading(state, resource) {
			state[resource].loading = true
		},

		referralLinksLoaded(state, referrals) {
			state.referralLinks.v = referrals
			state.referralLinks.loading = false
		},

		resourceLoaded(state, info) {
			state[info.resource].v = info.data
			state[info.resource].loading = false
			state[info.resource].loaded = true
		}
	},

	actions: {
		loadMembers({ commit }) {
			commit('setLoading', 'members')
			return api
				.get('admin/members')
				.then(data => commit('membersLoaded', data.members))
		},

		loadTrials({ commit }) {
			commit('setLoading', 'trials')
			return api
				.get('admin/trials')
				.then(data => commit('trialsLoaded', data.trials))
		},

		loadStatistics({ commit }) {
			commit('setLoading', 'statistics')
			return api
				.get('admin/statistics')
				.then(data => commit('statisticsLoaded', data.statistics))
		},

		loadTemplates({ commit }) {
			commit('setLoading', 'templates')
			return api
				.get('admin/templates')
				.then(data => commit('templatesLoaded', data.templates))
		},

		loadFlows({ commit }) {
			commit('setLoading', 'flows')
			return api
				.get('admin/flows')
				.then(data => commit('flowsLoaded', data.flows))
		},

		loadFlowResponses({ commit }, flowId) {
			commit('setLoading', 'flowResponses')
			return api
				.get(`admin/flows/${flowId}/responses`)
				.then(data => commit('flowResponsesLoaded', data))
		},

		loadReferralLinks({ commit }) {
			commit('setLoading', 'referralLinks')
			return api
				.get(`admin/referral-links`)
				.then(data => commit('referralLinksLoaded', data.referralLinks))
		},

		loadReferrals({ commit }) {
			commit('setLoading', 'referrals')
			return api
				.get('admin/referrals')
				.then(data => commit('referralsLoaded', data.referrals))
		},

		loadDiscordRoles({ commit }) {
			commit('setLoading', 'discordRoles')
			return api.get('admin/discord/roles').then(data =>
				commit('resourceLoaded', {
					resource: 'discordRoles',
					data: data.roles
				})
			)
		},

		loadDiscordChannels({ commit }) {
			commit('setLoading', 'discordChannels')
			return api.get('admin/discord/channels').then(data =>
				commit('resourceLoaded', {
					resource: 'discordChannels',
					data: data.channels
				})
			)
		},

		fetchResource({ commit }, { name }) {
			if (!(name in resourceFetchInformation))
				throw new Error('Call of fetchResource with invalid resource name')
			const fetchInfo = resourceFetchInformation[name]

			commit('setLoading', name)
			return api.get(fetchInfo.get).then(data => {
				commit('resourceLoaded', {
					resource: name,
					data: fetchInfo.getKey ? data[fetchInfo.getKey] : data
				})
			})
		}
	}
}
