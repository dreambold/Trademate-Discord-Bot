import { Model, Table, Column, DataType, BelongsTo } from 'sequelize-typescript'
import { UsinFilledBlock } from './usin-entry'
import { DbUsinFlow } from './usin-flow'

@Table({
	tableName: 'usin_ongoing_entries',
	modelName: 'UsinOngoingEntry'
})
export class DbUsinOngoingEntry extends Model<DbUsinOngoingEntry> {
	@BelongsTo(() => DbUsinFlow, 'flowId')
	flow!: DbUsinFlow

	@Column({ type: DataType.INTEGER })
	flowId!: number

	@Column({ type: DataType.JSONB, defaultValue: [] })
	blocks!: UsinFilledBlock[]

	@Column({ type: DataType.STRING, allowNull: false })
	discordUserId!: string

	/**
	 * Last message ID is only set if the entry is currently ongoing
	 */
	@Column({ type: DataType.STRING })
	lastMessageId!: string

	@Column({ type: DataType.INTEGER, defaultValue: 0 })
	currentStep!: number

	@Column({ type: DataType.DATE, allowNull: true })
	plannedAt!: Date | null
}
