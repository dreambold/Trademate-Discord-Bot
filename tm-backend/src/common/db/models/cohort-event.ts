import { Model, Table, Column, DataType } from 'sequelize-typescript'
import moment from 'moment'
import { Op } from 'sequelize'

export enum CohortEventType {
	JOIN = 'join',
	TRIAL_STARTED = 'trial_started',
	CONVERT_PREMIUM = 'convert_premium',

	// Cohort event type tracking which channels a user sends messages in. This
	// is treated differently as only a single event of this type exists per
	// user per day, and the "data" field is used to store channel IDs.
	CHANNEL_POST = 'channel_post'
}

@Table({
	tableName: 'cohort_events',
	modelName: 'CohortEvent'
})
export class DbCohortEvent extends Model<DbCohortEvent> {
	@Column({ type: DataType.STRING(32), allowNull: false })
	type!: string

	@Column({ type: DataType.DATE, allowNull: false })
	cohortAt!: Date

	@Column({ type: DataType.DATE, allowNull: false })
	eventAt!: Date

	@Column({ type: DataType.JSONB, allowNull: true })
	data!: any

	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordUserId!: string

	static async createEvent(
		type: CohortEventType,
		discordUserId: string,
		cohortType = CohortEventType.JOIN
	) {
		const cohortAt = await DbCohortEvent.getCohortDate(
			discordUserId,
			cohortType
		)

		return await DbCohortEvent.create({
			type,
			discordUserId,
			cohortAt,
			eventAt: new Date()
		})
	}

	static async createChannelEvent(
		discordUserId: string,
		discordChannelId: string
	) {
		let cohortAt = await DbCohortEvent.getCohortDate(discordUserId)

		let [event] = await DbCohortEvent.findOrBuild({
			where: {
				type: CohortEventType.CHANNEL_POST,
				eventAt: {
					[Op.gt]: moment()
						.startOf('day')
						.toISOString(),
					[Op.lt]: moment()
						.endOf('day')
						.toISOString()
				},
				discordUserId
			},
			defaults: {
				type: CohortEventType.CHANNEL_POST,
				cohortAt,
				eventAt: new Date()
			}
		})

		event.data = event.data || []

		if (!event.data.includes(discordChannelId)) {
			event.data.push(discordChannelId)
		}

		await event.save()
	}

	/**
	 * Safe version of `createChannelEvent` (never throws)
	 */
	static async safeCreateChannelEvent(
		discordUserId: string,
		discordChannelId: string
	) {
		try {
			await this.createChannelEvent(discordUserId, discordChannelId)
		} catch (e) {
			console.error('Error when creating cohort channel event')
			console.error(e)
		}
	}

	static async getCohortDate(
		discordUserId: string,
		type = CohortEventType.JOIN
	) {
		const firstJoinEvent = await DbCohortEvent.findOne({
			where: {
				discordUserId,
				type
			},
			order: [['cohortAt', 'ASC']]
		})

		return firstJoinEvent?.cohortAt ?? new Date()
	}
}
