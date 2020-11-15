import { Model, Table, Column, BelongsTo, DataType } from 'sequelize-typescript'
import { DbUser } from './user'

@Table({
	tableName: 'subscriptions',
	modelName: 'Subscription'
})
export class DbSubscription extends Model<DbSubscription> {
	@BelongsTo(() => DbUser, 'userId')
	user!: DbUser

	@Column({ type: DataType.STRING(25) })
	status!: string

	@Column({ type: DataType.STRING(64) })
	stripeCustomerId!: string

	@Column({ type: DataType.STRING(64) })
	stripeSubscriptionId!: string

	@Column({ type: DataType.STRING(64) })
	planId!: string

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	hasHadDiscount!: boolean
}
