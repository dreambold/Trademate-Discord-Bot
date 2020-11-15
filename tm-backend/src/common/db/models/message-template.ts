import { Model, Column, Table, DataType, Unique } from 'sequelize-typescript'

interface Template {
	description: string
	replacements?: { [k: string]: string }
	template: {
		type: 'embed' | 'string'
		v: any
	}
}

@Table({
	tableName: 'message_templates',
	modelName: 'MessageTemplate'
})
export class DbMessageTemplate extends Model<DbMessageTemplate> {
	@Unique
	@Column({ type: DataType.STRING(32), allowNull: false })
	slug!: string

	@Column({ type: DataType.JSONB, allowNull: false })
	template!: Template['template']
}

/**
 * These are descriptions shown to the admin who is editing the templates
 */
export const defaultTemplates: { [slug: string]: Template } = {
	welcomeMessage: {
		description: 'Message sent when a user joins the server.',
		replacements: {
			mention: 'A mention of the user'
		},
		template: {
			type: 'embed',
			v: {
				title:
					'Welcome to Trademate! To become a member and get access to all our exclusive signals and research: Click “UPGRADE ROLE”, then proceed to checkout. Once this step is done, you will have access to all of our channels.',
				description: '➡ **[UPGRADE ROLE](https://bot.trademate.club/)** ⬅',
				footer: {
					text: ''
				}
			}
		}
	},

	newMemberEmail: {
		description: 'Email sent when a new member subscribes.',
		template: {
			type: 'string',
			v: `Thank you for signing up to a Trademate membership account! Here are some useful links for you:<br>
<br>
<ul>
    <li><a href="https://discord.gg/n2CYdC6">Join Trademate chat room</a></li>
    <li><a href="https://bot.trademate.club/">Manage membership</a></li>
    <li><a href="https://trademate.club/">Our Website</a></li>
</ul>`
		}
	},

	memberPlanChangeEmail: {
		description: 'Email sent when a member changes their plan.',
		template: {
			type: 'string',
			v: ''
		}
	},

	loginViaEmail: {
		description: 'Email sent when a user asks to log in with email',
		replacements: {
			dashboard_link:
				'Link that, when clicked, will send the user to the dashboard.'
		},
		template: {
			type: 'string',
			v: `Someone has requested to login to your Trademate account. If this was you, the following link will log you in automatically:
<br>
<a href="{dashboard_link}">Go to dashboard</a>
<br>
If this was not you, you can safely ignore this email.`
		}
	},

	userUpgradedMessage: {
		description: 'Message sent when a user joins the server.',
		replacements: {
			mention: 'A mention of the user'
		},
		template: {
			type: 'string',
			v: '⬆️ {mention} ⬆️ you are now a Trademate member!'
		}
	},

	trialStartedMessage: {
		description: 'Message sent when a user starts a trial',
		replacements: {
			mention: 'A mention of the user'
		},
		template: {
			type: 'string',
			v: '⬆️ {mention} ⬆️ has activated a trial!'
		}
	}
}

export const getMessageTemplate = async (
	slug: keyof typeof defaultTemplates
) => {
	const dbTemplate = await DbMessageTemplate.findOne({
		where: {
			slug
		}
	})

	return (dbTemplate && dbTemplate.template) || defaultTemplates[slug].template
}

export async function getMessageTemplateReady(
	slug: string,
	replacements: { [k: string]: string }
) {
	const tpl = await getMessageTemplate(slug)

	const doReplace = (str: string) => {
		for (let replacement of Object.entries(replacements)) {
			str = str.replace(`{${replacement[0]}}`, replacement[1])
		}
		return str
	}

	if (tpl.type == 'embed') {
		let v = JSON.parse(JSON.stringify(tpl.v))
		v.title = doReplace(v.title)
		v.description = doReplace(v.description)
		v.footer.text = doReplace(v.footer.text)
		return { embed: v }
	} else return doReplace(tpl.v)
}
