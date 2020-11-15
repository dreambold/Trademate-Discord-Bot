import AppCard from '../../../components/ui/AppCard'
import AppButton from '../../../components/ui/AppButton.vue'
import { mapState } from 'vuex'

export default {
	components: {
		AppCard,
		AppButton
	},

	data() {
		return {
			columns: [
				{
					label: 'Identifier',
					field: 'slug'
				},
				{
					label: 'Description',
					field: 'description'
				},
				{
					label: 'Actions',
					field: 'actions',
					sortable: false,
					tdClass: 'text-right'
				}
			]
		}
	},

	computed: {
		...mapState({
			templates: state => state.admin.templates
		}),

		rows() {
			return Object.entries(this.templates.v).map(
				([templateSlug, template]) => {
					return {
						slug: templateSlug,
						description: template.description
					}
				}
			)
		}
	},

	created() {
		this.$store.dispatch('admin/loadTemplates')
	}
}
