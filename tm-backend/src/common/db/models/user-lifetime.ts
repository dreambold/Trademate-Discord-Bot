import { Model, Table, Column, DataType } from 'sequelize-typescript'

export enum Lifetime {
	PAID = 'paid',
	FREE = 'free'
}

@Table({
	tableName: 'user_lifetimes',
	modelName: 'UserLifetime'
})
export class DbUserLifetime extends Model<DbUserLifetime> {
	@Column({ type: DataType.STRING(10), allowNull: false })
	type!: string

	@Column({ type: DataType.DATE, allowNull: false })
	startAt!: Date

	@Column({ type: DataType.DATE, allowNull: true })
	endAt!: Date

	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordUserId!: string

	static async startLifetime(type: Lifetime, discordUserId: string) {
		let lifetime = await DbUserLifetime.findOne({
			where: {
				type,
				discordUserId,
				endAt: null
			}
		})

		if (lifetime) return null

		return await DbUserLifetime.create({
			type,
			discordUserId,
			startAt: new Date()
		})
	}

	static async endLifetime(type: Lifetime, discordUserId: string) {
		let lifetime = await DbUserLifetime.findOne({
			where: {
				type,
				discordUserId,
				endAt: null
			}
		})

		if (!lifetime) return null

		lifetime.endAt = new Date()
		await lifetime.save()
		return lifetime
	}
}
