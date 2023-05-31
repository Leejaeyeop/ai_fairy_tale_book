import { createStore } from "vuex";

export default createStore({
    state: {
        loadedPercent: 0,
        initCompleted: false,
    },
    getters: {
        loadedPercent(state) {
            return state.loadedPercent;
        },
        initCompleted(state) {
            return state.initCompleted;
        },
    },
    mutations: {
        changeLoadedPercent(state, value) {
            state.loadedPercent = value;
        },
        changeInitCompleted(state, value) {
            state.initCompleted = value;
        },
    },
    actions: {
        setLoadedPercent(context, value) {
            context.commit("changeLoadedPercent", value);
        },
        setInitCompleted(context, value) {
            context.commit("changeInitCompleted", value);
        },
    },
});
