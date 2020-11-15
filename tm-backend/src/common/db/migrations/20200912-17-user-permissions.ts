import { QueryInterface, DataTypes } from 'sequelize'

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.addColumn(
			'users',
			'permissions',
			{
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
				defaultValue: []
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
		await q.removeColumn('users', 'permissions', { transaction: t })

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
