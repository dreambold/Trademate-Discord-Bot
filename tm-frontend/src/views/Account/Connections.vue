<template>
    <div>
        <AppCard class="mb-3">
            <h3 class="m-0">Connections</h3>
        </AppCard>

        <div v-if="loaded" class="mb-3">
            <DiscordCard :account="user && user.discordAccount"></DiscordCard>
            <!-- <DiscordCard :account="false"></DiscordCard> -->
        </div>

        <AppCard>
            <div v-if="!loaded" class="text-center">
                <AppLoader></AppLoader>
            </div>
            <div v-else>
                <label>Email Address</label>
                <AppInput v-model="form.email">
                    This email address will allow you to log in if you lose
                    access to your Discord account. It will also receive
                    billing notifications.
                </AppInput>

                <AppButton @click="save" :disabled="saving">Save</AppButton>
            </div>
        </AppCard>
    </div>
</template>

<script src="./Connections.js"></script>
