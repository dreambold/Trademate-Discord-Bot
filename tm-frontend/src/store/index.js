import Vue from 'vue'
import Vuex from 'vuex'
import * as api from '../api'
import { adminStore } from './admin'

Vue.use(Vuex)

const resourceFetchInformation = {
	shopItems: {
		get: 'user/shop/items',
		getKey: 'items'
	},
	shopOrderHistory: {
		get: 'user/shop/order-history',
		getKey: 'orders'
	}
}

export default new Vuex.Store({
	state: {
		loaded: false,
		stripeKey: '',
		user: null,
		xpAvailable: 0,
		subscription: null,
		plans: [],
		products: [],
		urls: {
			web: '',
			api: ''
		},
		...Object.keys(resourceFetchInformation).reduce((prev, curr) => {
			prev[curr] = {
				loading: false,
				loaded: false,
				v: []
			}
			return prev
		}, {})
	},
	mutations: {
		infoLoaded(state, payload) {
			state.loaded = true

			for (let k of Object.keys(payload)) {
				if (k in state) {
					state[k] = payload[k]
				}
			}
		},

		setLoading(state, resource) {
			state[resource].loading = true
		},

		resourceLoaded(state, info) {
			state[info.resource].v = info.data
			state[info.resource].loading = false
			state[info.resource].loaded = true
		}
	},
	actions: {
		fetchData({ commit }) {
			return api.get('info').then(payload => commit('infoLoaded', payload))
		},

		fetchResource({ commit }, { name }) {
			if (!(name in resourceFetchInformation))
				throw new Error(
					'Call of fetchResource with invalid resource name ' + name
				)
			const fetchInfo = resourceFetchInformation[name]

			commit('setLoading', name)
			return api.get(fetchInfo.get).then(data => {
				commit('resourceLoaded', {
					resource: name,
					data: fetchInfo.getKey ? data[fetchInfo.getKey] : data
				})
			})
		}
	},
	modules: {
		admin: adminStore
	}
})
