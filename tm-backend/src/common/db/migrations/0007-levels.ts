import { QueryInterface, DataTypes } from 'sequelize'
import { DataType } from 'sequelize-typescript'

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

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.createTable(
			'levelling_user_levels',
			{
				...defaultColumns,
				discordUserId: {
					type: DataTypes.BIGINT(),
					allowNull: false
				},
				xp: {
					type: DataTypes.INTEGER(),
					allowNull: false,
					defaultValue: 0
				},
				xpAvailable: {
					type: DataTypes.INTEGER(),
					allowNull: false,
					defaultValue: 0
				},
				highestXp: {
					type: DataTypes.INTEGER(),
					allowNull: false,
					defaultValue: 0
				},
				channelParticipations: {
					type: DataTypes.ARRAY(DataTypes.BIGINT()),
					allowNull: false,
					defaultValue: []
				},
				messageCount: {
					type: DataTypes.INTEGER(),
					allowNull: false,
					defaultValue: 0
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'levelling_ranks',
			{
				...defaultColumns,
				name: {
					type: DataType.STRING(),
					allowNull: false
				},
				levelRequired: {
					type: DataTypes.INTEGER(),
					allowNull: false
				},
				discordRoleRewardsIds: {
					type: DataTypes.ARRAY(DataTypes.BIGINT()),
					allowNull: false,
					defaultValue: []
				},
				rewardsDescription: {
					type: DataTypes.STRING(),
					allowNull: false
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'levelling_channel_settings',
			{
				...defaultColumns,
				discordChannelId: {
					type: DataTypes.BIGINT(),
					allowNull: false
				},
				initialMultiplier: {
					type: DataTypes.FLOAT(),
					allowNull: false,
					defaultValue: 1
				},
				multiplier: {
					type: DataTypes.FLOAT(),
					allowNull: false,
					defaultValue: 1
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
		await q.dropTable('levelling_user_levels', { transaction: t })
		await q.dropTable('levelling_ranks', { transaction: t })
		await q.dropTable('levelling_channel_settings', { transaction: t })

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
