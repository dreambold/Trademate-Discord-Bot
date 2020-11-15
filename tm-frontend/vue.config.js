const APP_VARIANT = require('./src/variant-config').APP_VARIANT

if (!APP_VARIANT) {
	throw new Error('Please set VUE_APP_VARIANT in tm-frontend/.env.local')
}

process.env.VUE_APP_VARIANT_NAME = APP_VARIANT.name

module.exports = {
	devServer: {
		proxy: 'http://localhost:8000'
	}
}
