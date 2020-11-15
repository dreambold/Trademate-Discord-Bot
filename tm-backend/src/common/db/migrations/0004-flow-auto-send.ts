import { QueryInterface, DataTypes } from 'sequelize'

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.addColumn(
			'usin_flows',
			'autoSendHours',
			{
				type: DataTypes.INTEGER,
				defaultValue: 168
			},
			{
				transaction: t
			}
		)
		await q.addColumn(
			'usin_flows',
			'autoSendAudience',
			{
				type: DataTypes.TEXT,
				defaultValue: 'trials'
			},
			{
				transaction: t
			}
		)
		await q.addColumn(
			'usin_flows',
			'autoSendCount',
			{
				type: DataTypes.INTEGER,
				defaultValue: 10
			},
			{
				transaction: t
			}
		)
		await q.addColumn(
			'usin_flows',
			'autoSendNext',
			{
				type: DataTypes.DATE,
				allowNull: true
			},
			{
				transaction: t
			}
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
		await q.removeColumn('usin_flows', 'autoSendHours', {
			transaction: t
		})
		await q.removeColumn('usin_flows', 'autoSendAudience', {
			transaction: t
		})
		await q.removeColumn('usin_flows', 'autoSendCount', {
			transaction: t
		})
		await q.removeColumn('usin_flows', 'autoSendNext', {
			transaction: t
		})

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
