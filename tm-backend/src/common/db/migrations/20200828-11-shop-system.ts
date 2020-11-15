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
			'shop_items',
			{
				...defaultColumns,
				name: {
					type: DataTypes.STRING(128),
					allowNull: false
				},
				description: {
					type: DataTypes.STRING(),
					allowNull: true
				},
				type: {
					// 'discord-roles' | 'manual' | 'membership-extension'
					type: DataTypes.STRING(32),
					allowNull: false
				},
				price: {
					type: DataTypes.INTEGER(),
					allowNull: false
				},
				archived: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false
				},
				data: {
					type: DataTypes.JSON,
					allowNull: false,
					defaultValue: {}
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'shop_orders',
			{
				...defaultColumns,
				itemId: {
					type: DataTypes.INTEGER(),
					allowNull: false
				},
				userId: {
					type: DataTypes.INTEGER(),
					allowNull: false
				},
				fulfilledAt: {
					type: DataTypes.DATE(),
					allowNull: true
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
		await q.dropTable('shop_items', { transaction: t })
		await q.dropTable('shop_orders', { transaction: t })

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
