export default {
	path: '/admin',
	component: () =>
		import(/* webpackChunkName: "admin" */ '../views/Admin/index.vue'),
	children: [
		{
			path: '',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Members/Members.vue'
				)
		},
		{
			path: 'trials',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Trials/Trials.vue'
				)
		},
		{
			path: 'referrals',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Referrals/Referrals.vue'
				)
		},
		{
			path: 'statistics',
			component: () =>
				import(/* webpackChunkName: "admin" */ '../views/Admin/Statistics.vue')
		},
		{
			path: 'members/:id',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Members/Member.vue'
				)
		},
		{
			path: 'messages',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Messages/Messages.vue'
				)
		},
		{
			path: 'messages/:slug',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Messages/Message.vue'
				)
		},
		{
			path: 'polls',
			component: () =>
				import(/* webpackChunkName: "admin" */ '../views/Admin/Polls/Polls.vue')
		},
		{
			path: 'polls/:id/edit',
			component: () =>
				import(/* webpackChunkName: "admin" */ '../views/Admin/Polls/Poll.vue')
		},
		{
			path: 'polls/:id/responses',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Polls/PollResponses.vue'
				)
		},
		{
			path: 'levels',
			component: () =>
				import(
					/* webpackChunkName: "admin" */ '../views/Admin/Levelling/index.vue'
				),
			children: [
				{
					path: '',
					component: () =>
						import(
							/* webpackChunkName: "admin" */ '../views/Admin/Levelling/RanksPane.vue'
						)
				},
				{
					path: 'multipliers',
					component: () =>
						import(
							/* webpackChunkName: "admin" */ '../views/Admin/Levelling/ChannelMultipliersPane.vue'
						)
				}
			]
		},
		{
			path: 'shop',
			component: () =>
				import(/* webpackChunkName: "admin" */ '../views/Admin/Shop/index.vue'),
			children: [
				{
					path: 'orders',
					component: () =>
						import(
							/* webpackChunkName: "admin" */ '../views/Admin/Shop/Orders.vue'
						)
				},
				{
					path: 'orders/:id',
					component: () =>
						import(
							/* webpackChunkName: "admin" */ '../views/Admin/Shop/OrderEdit.vue'
						)
				},
				{
					path: 'items',
					component: () =>
						import(
							/* webpackChunkName: "admin" */ '../views/Admin/Shop/Items.vue'
						)
				},
				{
					path: 'items/:id',
					component: () =>
						import(
							/* webpackChunkName: "admin" */ '../views/Admin/Shop/ItemEdit.vue'
						)
				}
			]
		}
	]
}
