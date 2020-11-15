import { Model, Column, Table, DataType } from 'sequelize-typescript'

@Table({
	tableName: 'levelling_ranks',
	modelName: 'LevellingRanks'
})
export class DbLevellingRanks extends Model<DbLevellingRanks> {
	@Column({ type: DataType.STRING(), allowNull: false })
	name!: string

	@Column({ type: DataType.INTEGER(), allowNull: false })
	levelRequired!: number

	@Column({
		type: DataType.ARRAY(DataType.BIGINT()),
		allowNull: false
	})
	discordRoleRewardsIds!: string[]

	@Column({ type: DataType.STRING(), allowNull: false, defaultValue: '' })
	rewardsDescription!: string
}
