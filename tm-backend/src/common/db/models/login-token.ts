import {
	Model,
	Column,
	Table,
	DataType,
	BelongsTo,
	Unique
} from 'sequelize-typescript'
import { DbUser } from './user'
import cuid from 'cuid'

@Table({
	tableName: 'login_tokens',
	modelName: 'LoginToken'
})
export class DbLoginToken extends Model<DbLoginToken> {
	@Unique
	@Column({ type: DataType.STRING(12), allowNull: false })
	token!: string

	@BelongsTo(() => DbUser, 'userId')
	user!: DbUser

	static createTokenFor(user: DbUser) {
		return DbLoginToken.create({
			token: cuid.slug(),
			userId: user.id
		})
	}
}
