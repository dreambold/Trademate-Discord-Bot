import { Model, Table, Column, DataType, HasMany } from 'sequelize-typescript'
import { DbUsinEntry } from './usin-entry'
import { DbUsinOngoingEntry } from './usin-ongoing-entry'
import moment from 'moment'

/**
 * USIN stands for USer INteraction. These are basically flows of messages. each
 * flow iw basically a list of blocks, each block is an interaction with a user,
 * like:
 *
 * - Sending a message
 * - Sending a message and waiting for a reply
 * - Sending a message and waiting for a reaction
 */
@Table({
	tableName: 'usin_flows',
	modelName: 'UsinFlow'
})
export class DbUsinFlow extends Model<DbUsinFlow> {
	@HasMany(() => DbUsinEntry, 'flowId')
	entries!: DbUsinEntry[]

	@HasMany(() => DbUsinOngoingEntry, 'flowId')
	ongoingEntries!: DbUsinOngoingEntry[]

	@Column({ type: DataType.STRING(64), allowNull: false })
	name!: string

	@Column({ type: DataType.STRING(256), defaultValue: '' })
	description!: string

	@Column({ type: DataType.JSONB, defaultValue: [], allowNull: false })
	blocks!: UsinBlock[]

	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	archived!: boolean

	// Name/description cannot be changed
	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	system!: boolean

	// True if the flow can only contain web-safe blocks
	// Only used for the "why did you leave" cancellation form
	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	webSafe!: boolean

	@Column({ type: DataType.DATE })
	lastSent!: Date

	@Column({ type: DataType.INTEGER, defaultValue: 168 })
	autoSendHours!: number

	@Column({ type: DataType.TEXT, defaultValue: 'trials' })
	autoSendAudience!: string

	@Column({ type: DataType.INTEGER, defaultValue: 10 })
	autoSendCount!: number

	@Column({ type: DataType.INTEGER, allowNull: true })
	autoSendNext!: Date | null | string

	async autoSendPlan() {
		if (!this.autoSendCount || !this.autoSendAudience || !this.autoSendHours) {
			this.autoSendNext = null
		} else {
			if (!this.autoSendNext) this.autoSendNext = moment().toISOString()

			while (moment(this.autoSendNext) < moment())
				this.autoSendNext = moment(this.autoSendNext)
					.add(this.autoSendHours, 'hours')
					.toISOString()
		}

		await this.save()
	}
}

export interface UsinBlock {
	/**
	 * Message: raw text message
	 * Embed: it's a Discord Rich Embed as plain JSON
	 */
	type: 'message' | 'embed'
	message: any
	promptType: 'text' | 'choice' | 'none' | 'rating'

	/**
	 * List of emojis only
	 */
	promptChoices?: string[]
}
