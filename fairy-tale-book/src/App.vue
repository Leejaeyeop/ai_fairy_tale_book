<template>
    <img
        class="background"
        src="background.jpg"
        style="position: absolute"
    />
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
html {
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.background {
    position: absolute;
    height: 100%;
    width: 100%;
}

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
