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
			'referral_links',
			{
				...defaultColumns,
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				code: {
					type: DataTypes.STRING(8),
					allowNull: false
				},
				active: {
					type: DataType.BOOLEAN,
					allowNull: false,
					defaultValue: true
				}
			},
			{ transaction: t }
		)
		await q.createTable(
			'referral_entries',
			{
				...defaultColumns,
				referralLinkId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				userId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				firstInvoiceAmount: {
					type: DataTypes.INTEGER,
					allowNull: false,
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
		await q.dropTable('referral_links', { transaction: t })
		await q.dropTable('referral_entries', { transaction: t })

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
