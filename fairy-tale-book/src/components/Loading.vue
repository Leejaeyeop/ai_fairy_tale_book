<template>
  <div class="container">
    <img class="background" :src="require('../assets/images/background.webp')" />
    <div class="title">
      <div style="text-align: center">Fairy Tale</div>
      <!-- <div class="sub-title">인공지능 동화 생성</div> -->
    </div>
    <div class="content">
      <div class="dot">
        불러오는 중...        
      </div>
      <div class="loaded-percent">
        {{loadedPercent}} %
      </div>
    </div>
    <div></div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loadedPercent = computed(() => {
  return Math.floor(store.getters.loadedPercent);
});
</script>
<style scoped>
.container {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: white;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  font-family: 'InkLipquid';
  color: white;
}

.title {
  font-weight: 900;
  font-size: 7rem;
  z-index: 1000;
  margin-top: 1rem;
}
.sub-title {
  font-weight: 500;
  font-size: 4rem;
  text-align: center;
}
.content {
  font-weight: 900;
  font-size: 3rem;
  z-index: 1000;
}
.loaded-percent {
  text-align: center;
  font-size: 6rem;
}
</style>
