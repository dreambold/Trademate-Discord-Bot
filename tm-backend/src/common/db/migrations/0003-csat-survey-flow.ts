import { QueryInterface } from 'sequelize'

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.bulkInsert(
			'usin_flows',
			[
				{
					name: 'CSAT7Days',
					description: `Customer satisfaction survey. Should include one rating interaction.`,
					blocks: '[]',
					system: true,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			],
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
		await q.bulkDelete('usin_flows', {
			name: 'CSAT7Days'
		})

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
