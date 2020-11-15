import AppCard from '../../components/ui/AppCard.vue'
import AppLoader from '../../components/ui/AppLoader.vue'

import { mapState } from 'vuex'

export default {
    components: {
        AppCard,
        AppLoader
    },

    computed: {
        ...mapState(['loaded'])
    }
}
