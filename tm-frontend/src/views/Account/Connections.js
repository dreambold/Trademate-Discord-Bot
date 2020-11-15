import AppCard from '../../components/ui/AppCard.vue'
import AppLoader from '../../components/ui/AppLoader.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import DiscordCard from '../../components/DiscordCard.vue'

import { mapState } from 'vuex'
import * as api from '../../api'

export default {
    components: {
        AppCard,
        AppLoader,
        DiscordCard,
        AppInput,
        AppButton
    },

    computed: {
        ...mapState(['loaded', 'user'])
    },

    data() {
        return {
            form: {
                email: ''
            },
            saving: false
        }
    },

    created() {
        this.reloadEmail()
    },

    watch: {
        'user.email'() {
            this.reloadEmail()
        }
    },

    methods: {
        reloadEmail() {
            if (this.user) {
                this.form.email = this.user.email
            }
        },

        save() {
            this.saving = true
            api.post('user/email', { email: this.form.email })
                .then(async () => {
                    await this.$store.dispatch('fetchData')
                    this.$notify('Email saved!')
                })
                .finally(() => {
                    this.saving = false
                })
        }
    }
}
