<template>
    <div class="container mt-4">
        <h2 class="mb-3">My Account</h2>

        <div class="row">
            <div class="col-lg-3">
                <AppCard fluid class="sidebar mb-3">
                    <a
                        class="nav-link"
                        v-for="(link, i) in sidebarLinks"
                        :key="i"
                        :href="'/#' + link[1]"
                        @click.prevent="$router.push(link[1]).catch(err => {})"
                    >{{ link[0] }}</a>
                    <span class="nav-link" @click="logout">Logout</span>
                </AppCard>
            </div>
            <div class="col-lg-9">
                <RouterView></RouterView>
            </div>
        </div>
    </div>
</template>

<script src="./index.js"></script>

<style lang="scss" scoped>
@import '../../style/variables';

.container {
    max-width: 900px;
}

::v-deep .c-card {
    background-color: rgba(0, 0, 0, 0.08);
}

.sidebar .nav-link {
    color: rgba(0, 0, 0, 0.6);
    cursor: pointer;

    &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        color: $primary-color;
    }
}
</style>
