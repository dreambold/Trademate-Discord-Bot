import AppModal from './AppModal.vue'
import AppInput from '../ui/AppInput.vue'
import AppButton from '../ui/AppButton.vue'

import * as api from '../../api'

import { mapState } from 'vuex'

export default {
    name: 'SendPollModal',

    components: {
        AppModal,
        AppInput,
        AppButton
    },

    props: {
        flow: {}
    },

    data() {
        return {
            loading: false,
            sendFilter: 'me'
        }
    },

    methods: {
        close() {
            if (!this.loading) this.$emit('close')
        },

        submitForm() {
            this.loading = true

            Promise.resolve()
                .then(async () => {
                    let res = await api.post('admin/flows/send', {
                        id: this.flow.id,
                        filter:
                            this.sendFilter === 'me'
                                ? {
                                      userID: this.user.discordAccount
                                          .discordUserId
                                  }
                                : this.sendFilter
                    })

                    this.$notify(
                        'Sent poll to ' + res.requestsSent + ' people!'
                    )
                })
                .catch(e => {
                    if (!e.apiError) {
                        console.error(e)
                        this.$notify({
                            type: 'error',
                            text: 'Error: ' + e.message
                        })
                    }
                })
                .finally(() => {
                    this.loading = false
                    this.close()
                })
        }
    },

    computed: {
        ...mapState({
            user: state => state.user
        }),

        canSend() {
            if (this.sendFilter === 'me') {
                return (
                    this.user.discordAccount &&
                    this.user.discordAccount.discordUserId
                )
            }

            return true
        }
    }
}
