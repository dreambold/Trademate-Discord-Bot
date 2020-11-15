import { Model, Table, Column, DataType } from 'sequelize-typescript'

@Table({
	tableName: 'trials',
	modelName: 'Trial'
})
export class DbTrial extends Model<DbTrial> {
	@Column({ type: DataType.STRING, allowNull: false })
	discordUserId!: string

	@Column({ type: DataType.DATE, allowNull: false })
	endsAt!: Date
}
