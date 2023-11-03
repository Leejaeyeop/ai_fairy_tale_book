<template>
    <div id="main">
        <div id="three"></div>
        <css-object></css-object>
        <v-btn
            class="home-btn"
            prepend-icon="mdi-home"
            size="x-large"
            @click="goHome()"
        >
            홈
        </v-btn>
    </div>
</template>

<script setup>
import Main from "@/scripts/main.three";
import cssObject from "./cssObject.vue";
import { onMounted } from "vue";
let main = null;

onMounted(() => {
    main = new Main();
    main.init();
});

async function goHome() {
    await main.goHome();
}
</script>

<style>
#main {
    position: relative;
}
#three {
    cursor:grab
}
.home-btn {
    position: absolute;
    bottom: 0px;
    height: 2rem;
    width: 3rem;
    font-family: "InkLipquid";
    font-weight: bold;
    font-size: 2rem;
}
</style>
