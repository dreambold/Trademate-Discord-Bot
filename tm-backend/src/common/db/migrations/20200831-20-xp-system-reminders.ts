import { QueryInterface, DataTypes } from 'sequelize'

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.addColumn(
			'levelling_user_levels',
			'lastMessageAt',
			{
				type: DataTypes.DATE,
				allowNull: true
			},
			{ transaction: t }
		)
		await q.addColumn(
			'levelling_user_levels',
			'lastReminderAt',
			{
				type: DataTypes.DATE,
				allowNull: true
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
		await q.removeColumn('levelling_user_levels', 'lastMessageAt', {
			transaction: t
		})
		await q.removeColumn('levelling_user_levels', 'lastReminderAt', {
			transaction: t
		})

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
