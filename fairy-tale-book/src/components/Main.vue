<template>
  <div style="position: relative">
    <div id="three" class="hello"></div>
    <css-object></css-object>
  </div>
</template>

<script setup>
import Main from "@/scripts/main.three";
import cssObject from "./cssObject.vue";
import { onMounted } from "vue";

onMounted(() => {
  const main = new Main();
  main.init();
});
</script>
<style></style>
