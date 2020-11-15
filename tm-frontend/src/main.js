import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Notifications from 'vue-notification'
import VueGoodTablePlugin from 'vue-good-table'
import Multiselect from 'vue-multiselect'
import 'vue-good-table/dist/vue-good-table.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { APP_VARIANT } from './variant-config'

window.APP_VARIANT = APP_VARIANT

Vue.config.productionTip = false

Vue.use(Notifications)
Vue.use(VueGoodTablePlugin)
Vue.component('VMultiselect', Multiselect)

import AppCard from './components/ui/AppCard.vue'
Vue.component('AppCard', AppCard)

import AppInput from './components/ui/AppInput.vue'
Vue.component('AppInput', AppInput)

import AppLoaderX from './components/ui/AppLoaderX.vue'
Vue.component('AppLoaderX', AppLoaderX)

import AppButton from './components/ui/AppButton.vue'
Vue.component('AppButton', AppButton)

Vue.mixin({
	computed: {
		APP_VARIANT() {
			return window.APP_VARIANT
		}
	},
	methods: {
		$jsonCopy(v) {
			return JSON.parse(JSON.stringify(v))
		}
	}
})

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
