import {
	Model,
	Table,
	Column,
	DataType,
	BelongsTo,
	HasMany
} from 'sequelize-typescript'
import { DbUser } from './user'
import cuid from 'cuid'
import { DbReferralEntry } from './referral-entry'
import { APIError } from '../../../web/utils/misc'

@Table({
	tableName: 'referral_links',
	modelName: 'ReferralLink'
})
export class DbReferralLink extends Model<DbReferralLink> {
	@Column({ type: DataType.INTEGER, allowNull: false })
	userId!: number

	@Column({ type: DataType.STRING(8), allowNull: false })
	code!: string

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
	active!: boolean

	@BelongsTo(() => DbUser, 'userId')
	user!: DbUser

	@HasMany(() => DbReferralEntry, 'referralLinkId')
	entries!: DbReferralEntry[]

	static async createForUser(user: DbUser, askedCode = '') {
		let code = askedCode || cuid.slug().slice(0, 7)
		let codeIsUnique = false

		while (!codeIsUnique) {
			codeIsUnique = !(await DbReferralLink.findOne({
				where: {
					code
				}
			}))

			// In case the user requests for a specific code
			if (!codeIsUnique && askedCode !== '') {
				throw new APIError('Code is already in use.')
			}

			if (!codeIsUnique) code = cuid.slug().slice(0, 7)
		}

		return DbReferralLink.create({
			userId: user.id,
			code
		})
	}
}
