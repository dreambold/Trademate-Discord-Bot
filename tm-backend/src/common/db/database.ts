import { Sequelize } from 'sequelize-typescript'
import bunyan from 'bunyan'

// Model imports
import { DbDiscordAccount } from './models/discord-account'
import { DbUser } from './models/user'
import { DbSubscription } from './models/subscription'
import { DbLoginToken } from './models/login-token'
import { DbMessageTemplate } from './models/message-template'
import { DbUsinFlow } from './models/usin-flow'
import { DbUsinEntry } from './models/usin-entry'
import { DbUsinOngoingEntry } from './models/usin-ongoing-entry'
import { DbTrial } from './models/trial'
import { DbUserLifetime } from './models/user-lifetime'
import { DbCohortEvent } from './models/cohort-event'
import { DbReferralLink } from './models/referral-link'
import { DbReferralEntry } from './models/referral-entry'
import { DbDiscordGuildMember } from './models/discord-guild-member'
import { DbLevellingChannelSettings } from './models/levelling-channel-settings'
import { DbLevellingRanks } from './models/levelling-rank'
import { DbLevellingUserLevel } from './models/levelling-user-level'
import { DbShopOrder } from './models/shop-order'
import { DbShopItem } from './models/shop-item'

let sequelize: Sequelize

const logger = bunyan.createLogger({
	name: 'database'
})

export function getDatabase() {
	return sequelize
}

export async function load() {
	await connect(process.env.DATABASE_URI)
	await initModels()
}

export async function connect(uri: string) {
	sequelize = new Sequelize(uri, {
		logging: false
	})

	await sequelize.authenticate()

	logger.info('Database connected')

	return sequelize
}

export async function initModels() {
	// NOTE: ALL MODELS must be added in here AT THE SAME TIME for associations
	// to work. (and they have to be added anyways to work at all)
	sequelize.addModels([
		DbDiscordAccount,
		DbUser,
		DbSubscription,
		DbLoginToken,
		DbMessageTemplate,
		DbUsinFlow,
		DbUsinEntry,
		DbUsinOngoingEntry,
		DbTrial,
		DbUserLifetime,
		DbCohortEvent,
		DbReferralLink,
		DbReferralEntry,
		DbDiscordGuildMember,
		DbLevellingChannelSettings,
		DbLevellingRanks,
		DbLevellingUserLevel,
		DbShopItem,
		DbShopOrder
	])
}

/**
 * Drops and re-creates the entire database schema. Loses all data.
 */
export async function forceSync() {
	logger.warn('Force syncing database...')
	await sequelize.sync({ force: true })
}
