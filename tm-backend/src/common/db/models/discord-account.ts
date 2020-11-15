import { Model, Column, DataType, Table, BelongsTo } from 'sequelize-typescript'
import { DbUser } from './user'

@Table({
	tableName: 'discord_accounts',
	modelName: 'DiscordAccount'
})
export class DbDiscordAccount extends Model<DbDiscordAccount> {
	@BelongsTo(() => DbUser, 'userId')
	user!: DbUser

	@Column({ type: DataType.INTEGER(), allowNull: false })
	userId!: number

	@Column({ type: DataType.STRING(32), allowNull: false })
	username!: string

	@Column({ type: DataType.STRING(4), allowNull: false })
	discriminator!: string

	@Column({ type: DataType.STRING(128), allowNull: false })
	avatarURI!: string

	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordUserId!: string
}
