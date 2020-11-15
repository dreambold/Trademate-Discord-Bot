import axios from 'axios'
import crypto from 'crypto'

const md5 = str => {
	return crypto
		.createHash('md5')
		.update(str)
		.digest('hex')
}

const mailchimpEmailHash = (str: string) => md5(str.toLowerCase())

const makeRequest = () => {
	return axios.create({
		baseURL: process.env.MAILCHIMP_BASE,
		auth: {
			password: process.env.MAILCHIMP_TOKEN,
			username: 'abc' // doesn't matter
		}
	})
}

const allTags = ['free-member', 'paid-member', 'canceled', 'trial']

export const Mailchimp = {
	subscribeToNewsletter(d: {
		email: string
		firstName: string
		lastName: string
	}) {
		return makeRequest().put(
			`lists/${process.env.MAILCHIMP_LIST_ID}/members/${mailchimpEmailHash(
				d.email
			)}`,
			{
				email_address: d.email,
				email_type: 'html',
				status: 'subscribed',
				merge_fields: {
					FNAME: d.firstName,
					LNAME: d.lastName
				}
			}
		)
	},

	unsubscribeFromNewsletter(email: string) {
		return makeRequest().delete(
			`lists/${process.env.MAILCHIMP_LIST_ID}/members/${mailchimpEmailHash(
				email
			)}`
		)
	},

	updateEmailTags(email: string, tags: string[]) {
		const genTags = [
			...tags.map(t => ({ name: t, status: 'active' })),
			...allTags
				.filter(t => !tags.includes(t))
				.map(t => ({ name: t, status: 'inactive' }))
		]

		return makeRequest().post(
			`lists/${process.env.MAILCHIMP_LIST_ID}/members/${mailchimpEmailHash(
				email
			)}/tags`,
			{
				tags: genTags
			}
		)
	},

	getEmailNewsletterStatus(email: string) {
		return makeRequest().get(
			`lists/${process.env.MAILCHIMP_LIST_ID}/members/${mailchimpEmailHash(
				email
			)}`
		)
	}
}
