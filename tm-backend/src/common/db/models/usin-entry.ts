import { Model, Table, Column, DataType, BelongsTo } from 'sequelize-typescript'
import { UsinBlock, DbUsinFlow } from './usin-flow'

@Table({
	tableName: 'usin_entries',
	modelName: 'UsinEntry'
})
export class DbUsinEntry extends Model<DbUsinEntry> {
	@BelongsTo(() => DbUsinFlow, 'flowId')
	flow!: DbUsinFlow

	@Column({ type: DataType.JSONB, defaultValue: [] })
	blocks!: UsinFilledBlock[]

	@Column({ type: DataType.STRING, allowNull: false })
	discordUserId!: string

	@Column({ type: DataType.STRING, allowNull: false })
	discordUserTag!: string
}

export interface UsinFilledBlock extends UsinBlock {
	promptAnswer: string
}
