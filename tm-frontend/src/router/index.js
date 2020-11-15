import Vue from 'vue'
import VueRouter from 'vue-router'
import GetAccess from '../views/GetAccess.vue'

import accountRoutes from './account'
import adminRoutes from './admin'

Vue.use(VueRouter)

const routes = [
	accountRoutes,
	adminRoutes,
	{
		path: '/',
		component: GetAccess
	},
	{
		path: '/trial/:userId',
		component: () =>
			import(/* webpackChunkName: "trial" */ '../views/GetTrial.vue')
	},
	{
		path: '/ranks',
		component: () =>
			import(/* webpackChunkName: "ranks" */ '../views/Ranks.vue')
	}
]

const router = new VueRouter({
	routes
})

export default router
