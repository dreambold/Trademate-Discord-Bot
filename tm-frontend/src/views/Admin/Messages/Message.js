import AppInput from '../../../components/ui/AppInput'
import AppCard from '../../../components/ui/AppCard'
import AppLoader from '../../../components/ui/AppLoader'
import AppButton from '../../../components/ui/AppButton'
import EmbedEditor from '../../../components/EmbedEditor.vue'
import * as api from '../../../api'

import { mapState } from 'vuex'
import merge from 'deepmerge'

import { EMPTY_EMBED } from '../../../utils'

export default {
    components: {
        AppInput,
        AppCard,
        AppLoader,
        AppButton,
        EmbedEditor
    },

    data() {
        return {
            templateValue: null,

            placeholderColumns: [
                {
                    label: 'Placeholder',
                    field: 'placeholder'
                },
                {
                    label: 'Description',
                    field: 'description'
                }
            ]
        }
    },

    computed: {
        ...mapState({
            templates: state => state.admin.templates
        }),

        rawTemplate() {
            return this.templates.v[this.$route.params.slug]
        },

        placeholderRows() {
            if (!this.rawTemplate) return []

            return Object.entries(this.rawTemplate.replacements || {}).map(
                ([placeholder, description]) => ({
                    placeholder,
                    description
                })
            )
        }
    },

    methods: {
        reloadTemplate() {
            const v = this.rawTemplate.template.v || ''

            if (typeof v === 'string') {
                // Simple text-only message
                this.templateValue = v
            } else {
                // Discord Embed. Should be edited with the EmbedEditor
                // We make sure
                this.templateValue = merge(
                    EMPTY_EMBED(),
                    typeof v === 'string' ? {} : v
                )
            }
        },

        save() {
            return api
                .post('admin/templates', {
                    slug: this.$route.params.slug,
                    template: {
                        type:
                            typeof this.templateValue === 'string'
                                ? 'string'
                                : 'embed',
                        v: this.templateValue
                    }
                })
                .then(() => this.$store.dispatch('admin/loadTemplates'))
        }
    },

    async created() {
        if (!this.rawTemplate) {
            await this.$store.dispatch('admin/loadTemplates')

            if (!this.rawTemplate) {
                this.$notify({
                    text: 'Message not found.',
                    type: 'error'
                })
                this.$router.push('/admin/messages')
            }
        } else {
            this.reloadTemplate()
        }
    },

    watch: {
        rawTemplate(t) {
            if (!t) {
                this.$notify({
                    text: 'Message not found.',
                    type: 'error'
                })
                this.$router.push('/admin/messages')

                return
            }

            this.reloadTemplate()
        }
    }
}
