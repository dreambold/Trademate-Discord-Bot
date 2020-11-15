import {
	Model,
	Column,
	Table,
	HasOne,
	DataType,
	IsEmail
} from 'sequelize-typescript'
import { DbDiscordAccount } from './discord-account'
import { DbSubscription } from './subscription'

export type UserPermission =
	| 'ADMINISTRATOR'
	| 'VIEW_USERS'
	| 'EDIT_USERS'
	| 'VIEW_DASHBOARD'
	| 'VIEW_TRIALS'
	| 'VIEW_REFERRALS'
	| 'EDIT_REFERRALS'
	| 'VIEW_POLLS'
	| 'EDIT_POLLS'
	| 'VIEW_MESSAGES'
	| 'EDIT_MESSAGES'
	| 'VIEW_STATISTICS'
	| 'VIEW_RANKS'
	| 'EDIT_RANKS'
	| 'VIEW_SHOP'
	| 'EDIT_SHOP'

@Table({
	tableName: 'users',
	modelName: 'User'
})
export class DbUser extends Model<DbUser> {
	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	rank!: number

	@Column({ type: DataType.STRING(32), allowNull: false })
	name!: string

	@IsEmail
	@Column({ type: DataType.STRING(128), allowNull: false })
	email!: string

	@Column({
		type: DataType.ARRAY(DataType.STRING()),
		allowNull: false,
		defaultValue: []
	})
	permissions!: UserPermission[]

	@HasOne(() => DbDiscordAccount, 'userId')
	discordAccount!: DbDiscordAccount

	@HasOne(() => DbSubscription, 'userId')
	subscription!: DbSubscription
}
