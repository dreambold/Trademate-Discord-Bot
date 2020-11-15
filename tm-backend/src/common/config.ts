export interface JsonConfigProduct {
	name: string
	stripeProductId: string
	stripePlanIds: string[]
	stripeLegacyPlanIds: string[]
	discordRoleId: string
}

interface JsonConfig {
	products: Array<JsonConfigProduct>
}

export function getJsonConfig(): JsonConfig {
	return require('../../../config.json')
}
