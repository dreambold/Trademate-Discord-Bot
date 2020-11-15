import { QueryInterface, DataTypes } from 'sequelize'

/*
 * This is the initial migration, creating all the tables that were here before
 * using a migration system.
 */

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	const defaultColumns = {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false
		}
	}

	try {
		await q.createTable(
			'users',
			{
				...defaultColumns,
				rank: {
					type: DataTypes.INTEGER,
					defaultValue: 0
				},
				name: {
					type: DataTypes.STRING(32),
					allowNull: false
				},
				email: {
					type: DataTypes.STRING(128),
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'discord_accounts',
			{
				...defaultColumns,
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				username: {
					type: DataTypes.STRING(32),
					allowNull: false
				},
				discriminator: {
					type: DataTypes.STRING(4),
					allowNull: false
				},
				avatarURI: {
					type: DataTypes.STRING(128),
					allowNull: false
				},
				discordUserId: {
					type: DataTypes.BIGINT,
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'subscriptions',
			{
				...defaultColumns,
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				status: {
					type: DataTypes.STRING(25)
				},
				stripeCustomerId: {
					type: DataTypes.STRING(64)
				},
				stripeSubscriptionId: {
					type: DataTypes.STRING(64)
				},
				planId: {
					type: DataTypes.STRING(64)
				},
				hasHadDiscount: {
					type: DataTypes.BOOLEAN
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'user_lifetimes',
			{
				...defaultColumns,
				type: {
					type: DataTypes.STRING(10),
					allowNull: false
				},
				startAt: {
					type: DataTypes.DATE,
					allowNull: false
				},
				endAt: {
					type: DataTypes.DATE
				},
				discordUserId: {
					type: DataTypes.BIGINT(),
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'message_templates',
			{
				...defaultColumns,
				slug: {
					type: DataTypes.STRING(32),
					allowNull: false
				},
				template: {
					type: DataTypes.JSONB,
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'cohort_events',
			{
				...defaultColumns,
				type: {
					type: DataTypes.STRING(32),
					allowNull: false
				},
				cohortAt: {
					type: DataTypes.DATE,
					allowNull: false
				},
				eventAt: {
					type: DataTypes.DATE
				},
				data: {
					type: DataTypes.JSONB
				},
				discordUserId: {
					type: DataTypes.BIGINT(),
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'login_tokens',
			{
				...defaultColumns,
				token: {
					type: DataTypes.STRING(12)
				},
				userId: {
					type: DataTypes.INTEGER
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'trials',
			{
				...defaultColumns,
				discordUserId: {
					type: DataTypes.BIGINT(),
					allowNull: false
				},
				endsAt: {
					type: DataTypes.DATE,
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'usin_entries',
			{
				...defaultColumns,
				flowId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				blocks: {
					type: DataTypes.JSONB,
					defaultValue: [],
					allowNull: false
				},
				discordUserId: {
					type: DataTypes.STRING,
					allowNull: false
				},
				discordUserTag: {
					type: DataTypes.STRING,
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'usin_flows',
			{
				...defaultColumns,
				name: {
					type: DataTypes.STRING(64),
					allowNull: false
				},
				description: {
					type: DataTypes.STRING(256),
					defaultValue: ''
				},
				blocks: {
					type: DataTypes.JSONB,
					defaultValue: [],
					allowNull: false
				},
				archived: {
					type: DataTypes.BOOLEAN,
					defaultValue: false
				},
				system: {
					type: DataTypes.BOOLEAN,
					defaultValue: false
				},
				webSafe: {
					type: DataTypes.BOOLEAN,
					defaultValue: false
				},
				lastSent: {
					type: DataTypes.DATE
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'usin_ongoing_entries',
			{
				...defaultColumns,
				flowId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				blocks: {
					type: DataTypes.JSONB,
					defaultValue: [],
					allowNull: false
				},
				discordUserId: {
					type: DataTypes.STRING,
					allowNull: false
				},
				lastMessageId: {
					type: DataTypes.STRING
				},
				currentStep: {
					type: DataTypes.INTEGER,
					defaultValue: 0
				}
			},
			{ transaction: t }
		)

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}

export async function down(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.dropTable('cohort_events', { transaction: t })
		await q.dropTable('discord_accounts', { transaction: t })
		await q.dropTable('login_tokens', { transaction: t })
		await q.dropTable('message_templates', { transaction: t })
		await q.dropTable('subscriptions', { transaction: t })
		await q.dropTable('trials', { transaction: t })
		await q.dropTable('user_lifetimes', { transaction: t })
		await q.dropTable('users', { transaction: t })
		await q.dropTable('usin_entries', { transaction: t })
		await q.dropTable('usin_ongoing_entries', { transaction: t })
		await q.dropTable('usin_flows', { transaction: t })

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
