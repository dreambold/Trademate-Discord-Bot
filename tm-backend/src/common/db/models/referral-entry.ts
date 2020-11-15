import { Model, Table, Column, DataType, BelongsTo } from 'sequelize-typescript'
import { DbUser } from './user'
import { DbReferralLink } from './referral-link'

@Table({
	tableName: 'referral_entries',
	modelName: 'ReferralEntry'
})
export class DbReferralEntry extends Model<DbReferralEntry> {
	@Column({ type: DataType.INTEGER, allowNull: false })
	referralLinkId!: number

	@BelongsTo(() => DbReferralLink, 'referralLinkId')
	referralLink!: DbReferralLink

	@Column({ type: DataType.INTEGER, allowNull: false })
	userId!: number

	@BelongsTo(() => DbUser, 'userId')
	user!: DbUser

	// Amount, in EUR
	@Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
	firstInvoiceAmount!: number
}
