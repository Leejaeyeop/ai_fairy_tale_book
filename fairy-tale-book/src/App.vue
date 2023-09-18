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
html {
    width: 100%;
    height: 100%;

    background: #11e8bb; /* Old browsers */
    background: -moz-linear-gradient(top, #11e8bb 0%, #8200c9 100%); /* FF3.6-15 */
    background: -webkit-linear-gradient(top, #edffef 0%, #edccff 100%); /* Chrome10-25,Safari5.1-6 */
    /* background: linear-gradient(to bottom, #e0e0e0 0%, #ff00ea93 100%); */
    /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    /* background-image: url("../public/background.jpg");
    background-size: 100%; */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#11e8bb', 
    endColorstr='#8200c9',GradientType=0 ); /* IE6-9 */
    overflow: hidden;
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
