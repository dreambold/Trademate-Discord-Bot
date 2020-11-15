import { QueryInterface, DataTypes, Op } from 'sequelize'

const flowNames = [
	'TrialDay1',
	'TrialDay2',
	'TrialDay3',
	'TrialDay4',
	'TrialDay5',
	'TrialDay6',
	'TrialDay7'
]

export async function up(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await q.addColumn(
			'usin_ongoing_entries',
			'plannedAt',
			{
				type: DataTypes.DATE,
				allowNull: true
			},
			{ transaction: t }
		)
		await q.bulkInsert(
			'usin_flows',
			flowNames.map((name, i) => {
				return {
					name,
					description: `Poll sent to trial members on day ${i +
						1} of their trial.`,
					blocks: '[]',
					system: true,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			}),
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
		await q.removeColumn('usin_ongoing_entries', 'plannedAt', {
			transaction: t
		})
		await q.bulkDelete('usin_flows', {
			name: {
				[Op.in]: flowNames
			}
		})

		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
