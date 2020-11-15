import Vue from 'vue'
import { handleCardPayment } from 'vue-stripe-elements-plus'
import * as api from './api'

export function formatDate(d) {
	if (typeof d === 'string') {
		d = new Date(d)
	}

	return (
		'' +
		d
			.getDate()
			.toString()
			.padStart(2, '0') +
		'/' +
		(d.getMonth() + 1).toString().padStart(2, '0') +
		'/' +
		d
			.getFullYear()
			.toString()
			.padStart(2, '0')
	)
}

export function formatTime(d) {
	if (typeof d === 'string') {
		d = new Date(d)
	}

	return (
		'' +
		d
			.getHours()
			.toString()
			.padStart(2, '0') +
		':' +
		d
			.getMinutes()
			.toString()
			.padStart(2, '0')
	)
}

export function formatDateTime(d) {
	return `${formatDate(d)} ${formatTime(d)}`
}

/**
 * Takes a function and wraps it in an error handler that will show an "internal
 * server error" to the user
 */
export function wrapErrorHandler(f) {
	return () => {
		return Promise.resolve(f()).catch(e => {
			Vue.notify({
				type: 'error',
				text: 'An internal error occured.'
			})
		})
	}
}

/**
 * Handles any follow-ups required (like 3D Secure or smth)
 */
export async function handlePaymentFollowup(sub) {
	if (sub.paymentStatus === 'requires_payment_method') {
		Vue.notify('Failed to charge your card. Please try using another card.')
	} else if (sub.paymentStatus === 'requires_action') {
		await handleCardPayment(sub.paymentIntentSecret)

		try {
			await api.post('user/membership/subscribe', {
				action: 'confirm'
			})
		} catch (e) {
			return Vue.notify(
				'Failed to charge your card. Please try using another card.'
			)
		}
	}
}

export function EMPTY_EMBED() {
	return {
		color: 0,
		title: '',
		url: '',
		author: {
			name: '',
			icon_url: '',
			url: ''
		},
		description: '',
		thumbnail: {
			url: ''
		},
		fields: [],
		image: {
			url: ''
		},
		timestamp: new Date(),
		footer: {
			text: '',
			icon_url: ''
		}
	}
}
