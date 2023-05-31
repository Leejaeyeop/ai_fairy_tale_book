<template>
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <Loading v-if="!isLoaded"></Loading>
    <Main />
</template>

<script>
import { computed } from "vue";
import Main from "./components/Main.vue";
import Loading from "./components/Loading.vue";
import { useStore } from "vuex";

export default {
    name: "App",
    components: {
        Main,
        Loading,
    },
    setup() {
        const store = useStore();
        const isLoaded = computed(() => {
            return store.getters.initCompleted;
        });
        return {
            isLoaded,
        };
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    /* margin-top: 60px; */
}
body {
    margin: 0px;
}
</style>
