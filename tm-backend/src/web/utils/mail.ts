import nodemailer from 'nodemailer'
import { server } from '../server'
import { DbLoginToken } from '../../common/db/models/login-token'
import { DbUser } from '../../common/db/models/user'
import { getMessageTemplateReady } from '../../common/db/models/message-template'

export function createMailTransport() {
	return nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT),
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		},
		tls: {
			rejectUnauthorized: false
		}
	})
}

export async function sendEmailTemplate(
	to: string,
	template: keyof typeof templates,
	data
) {
	const transport = createMailTransport()
	const info = templates[template](data)

	return transport.sendMail({
		to,
		from: process.env.SMTP_FROM,
		...info,
		html: ((await getMessageTemplateReady(template, data)) as unknown) as string
	})
}

const templates = {
	newMemberEmail: (data: { user: DbUser }) => ({
		subject: 'Activate your Trademate membership'
	}),

	loginViaEmail: () => ({
		subject: 'Login to your Trademate account'
	})
}
