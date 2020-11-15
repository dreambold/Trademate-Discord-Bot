import axios from 'axios'

import Vue from 'vue'

export async function get(url, params) {
	return axios({
		method: 'get',
		baseURL: '/api/',
		withCredentials: true,
		url,
		params
	})
		.then(res => {
			if (res.data.error) throw Error(res.data.error)

			return res.data.data
		})
		.catch(e => {
			e.apiError = true

			console.error('API Error:', e)

			Vue.notify({
				text: 'An error occured: ' + e.message,
				type: 'error'
			})

			throw e
		})
}

export async function post(url, data, params) {
	return axios({
		method: 'post',
		baseURL: '/api/',
		withCredentials: true,
		url: url.trimLeft('/'),
		data,
		params
	})
		.then(res => {
			if (res.data.error) throw Error(res.data.error)

			return res.data.data
		})
		.catch(e => {
			e.apiError = true

			console.error('API Error:', e)

			Vue.notify({
				text: 'An error occured: ' + e.message,
				type: 'error'
			})

			throw e
		})
}

export async function del(url, data, params) {
	return axios({
		method: 'delete',
		baseURL: '/api/',
		withCredentials: true,
		url: url.trimLeft('/'),
		data,
		params
	})
		.then(res => {
			if (res.data.error) throw Error(res.data.error)

			return res.data.data
		})
		.catch(e => {
			e.apiError = true

			console.error('API Error:', e)

			Vue.notify({
				text: 'An error occured: ' + e.message,
				type: 'error'
			})

			throw e
		})
}
