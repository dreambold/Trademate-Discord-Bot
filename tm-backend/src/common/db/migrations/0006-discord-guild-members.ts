import { QueryInterface, DataTypes } from 'sequelize'

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
			'discord_guild_members',
			{
				...defaultColumns,
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
					type: DataTypes.BIGINT(),
					allowNull: false
				},
				discordGuildId: {
					type: DataTypes.BIGINT(),
					allowNull: false
				},
				discordRoleIds: {
					type: DataTypes.ARRAY(DataTypes.BIGINT()),
					allowNull: false
				},
				active: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: true
				},
				bot: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false
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
		await q.dropTable('discord_guild_members', { transaction: t })

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
