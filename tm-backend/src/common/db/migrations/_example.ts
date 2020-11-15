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
		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}

export async function down(q: QueryInterface) {
	const t = await q.sequelize.transaction()

	try {
		await t.commit()
	} catch (e) {
		await t.rollback()
		throw e
	}
}
