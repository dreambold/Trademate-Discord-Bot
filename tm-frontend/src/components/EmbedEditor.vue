<template>
    <AppCard>
        <label>Title</label>
        <AppInput v-model="value.title"></AppInput>

        <label>Description</label>
        <AppInput type="textarea" v-model="value.description"></AppInput>

        <label>Footer</label>
        <AppInput v-model="value.footer.text"></AppInput>
    </AppCard>
</template>

<script src="./EmbedEditor.js"></script>
