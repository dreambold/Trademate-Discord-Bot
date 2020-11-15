import { Model, Column, Table, DataType, BelongsTo } from 'sequelize-typescript'
import { DbDiscordGuildMember } from './discord-guild-member'

@Table({
	tableName: 'levelling_user_levels',
	modelName: 'LevellingUserLevels'
})
export class DbLevellingUserLevel extends Model<DbLevellingUserLevel> {
	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordUserId!: string

	@Column({ type: DataType.INTEGER(), allowNull: false, defaultValue: 0 })
	xp!: number

	@Column({ type: DataType.INTEGER(), allowNull: false, defaultValue: 0 })
	highestXp!: number

	@Column({ type: DataType.INTEGER(), allowNull: false, defaultValue: 0 })
	xpAvailable!: number

	@Column({ type: DataType.INTEGER(), allowNull: false, defaultValue: 0 })
	messageCount!: number

	@Column({ type: DataType.DATE(), allowNull: true })
	lastMessageAt!: Date | null

	@Column({ type: DataType.DATE(), allowNull: true })
	lastReminderAt!: Date | null

	@Column({
		type: DataType.ARRAY(DataType.BIGINT()),
		allowNull: false
	})
	channelParticipations!: string[]

	@BelongsTo(() => DbDiscordGuildMember, {
		foreignKey: 'discordUserId',
		targetKey: 'discordUserId'
	})
	discordAccount!: DbDiscordGuildMember
}
