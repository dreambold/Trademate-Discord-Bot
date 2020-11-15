const configVariants = {
	trademate: {
		slug: 'trademate',
		name: 'Trademate'
	},
	tradex: {
		slug: 'tradex',
		name: 'TradeX'
	},
	'trademate-forex': {
		slug: 'trademate-forex',
		name: 'Trademate Forex'
	}
}

module.exports.APP_VARIANT = configVariants[process.env.VUE_APP_VARIANT]
