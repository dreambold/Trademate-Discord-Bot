declare global {
	namespace NodeJS {
		interface ProcessEnv extends Config {}
	}
}

export interface Config {
	DISCORD_TOKEN: string
	DISCORD_CLIENT_ID: string
	DISCORD_CLIENT_SECRET: string
	DISCORD_GAME: string
	DISCORD_PREFIX: string

	SMTP_USER: string
	SMTP_PASS: string
	SMTP_HOST: string
	SMTP_PORT: string
	SMTP_FROM: string

	STRIPE_PUBLIC_KEY: string
	STRIPE_SECRET_KEY: string
	STRIPE_PRODUCT_ID: string
	STRIPE_CANCELLATION_COUPON_ID: string

	DATABASE_URI: string

	WEB_PORT: string
	API_BASE_URI: string
	WEB_BASE_URI: string

	GUILD_ID: string

	// Trial role ID
	TRIAL_ROLE_ID: string

	// Role given when a user has had a trial (and doesn't anymore)
	OLD_TRIAL_ROLE_ID: string

	JOIN_MESSAGE_CHANNEL_ID: string
	UPGRADE_MESSAGE_CHANNEL_ID: string
	TRIAL_MESSAGE_CHANNEL_ID: string

	// Log messages can be forwarded to a central logging service running on
	// Graylog through the use of a WebSocket-based proxy. This is the full URL
	// to that proxy.
	//
	// Example: wss://graylog.domain.tld/log/mysecuretokenhere
	GRAYLOG_PROXY_URI: string

	// URI to Prometheus for displaying statistics in the dashboard. Should not
	// include any path.
	PROMETHEUS_URI: string

	MAILCHIMP_TOKEN: string
	MAILCHIMP_LIST_ID: string
	MAILCHIMP_BASE: string
}

export interface DiscordUserData {
	username: string
	verified: boolean
	locale: string
	premiumType: number
	mfaEnabled: boolean
	id: string
	flags: number
	avatar: string
	discriminator: string
	email: string
}

export interface DiscordTokenData {
	accessToken: string
	scope: string
	tokenType: string
	expiresIn?: number
	refreshToken: string

	guild?: any
}

// There are a few other props as well, see Stripe docs
export interface StripePlan {
	id: string
	object: string
	active: boolean
	amount: number
	created: number
	currency: string
	interval: string
	interval_count: number
	livemode: boolean
	metadata: any
	nickname: string | null
	product: string
}
