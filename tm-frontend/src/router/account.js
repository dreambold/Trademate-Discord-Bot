export default {
	path: '/account',
	component: () =>
		import(/* webpackChunkName: "account" */ '../views/Account/index.vue'),
	children: [
		{
			path: '',
			component: () =>
				import(
					/* webpackChunkName: "account" */ '../views/Account/Overview.vue'
				)
		},
		{
			path: 'billing',
			component: () =>
				import(/* webpackChunkName: "account" */ '../views/Account/Billing.vue')
		},
		{
			path: 'billing/cancel',
			component: () =>
				import(
					/* webpackChunkName: "billing-cancel" */ '../views/Account/BillingCancel.vue'
				)
		},
		{
			path: 'connections',
			component: () =>
				import(
					/* webpackChunkName: "account" */ '../views/Account/Connections.vue'
				)
		},
		{
			path: 'shop',
			component: () =>
				import(
					/* webpackChunkName: "account" */ '../views/Account/Shop/index.vue'
				),
			children: [
				{
					path: '',
					component: () =>
						import(
							/* webpackChunkName: "account" */ '../views/Account/Shop/Items.vue'
						)
				},
				{
					path: 'order-history',
					component: () =>
						import(
							/* webpackChunkName: "account" */ '../views/Account/Shop/OrderHistory.vue'
						)
				}
			]
		}
	]
}
