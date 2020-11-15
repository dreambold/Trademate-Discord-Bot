import { Model, Column, Table, DataType } from 'sequelize-typescript'

@Table({
	tableName: 'levelling_channel_settings',
	modelName: 'LevellingChannelSettings'
})
export class DbLevellingChannelSettings extends Model<
	DbLevellingChannelSettings
> {
	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordChannelId!: string

	@Column({ type: DataType.FLOAT(), allowNull: false, defaultValue: 1 })
	initialMultiplier!: number

	@Column({ type: DataType.FLOAT(), allowNull: false, defaultValue: 1 })
	multiplier!: number
}
