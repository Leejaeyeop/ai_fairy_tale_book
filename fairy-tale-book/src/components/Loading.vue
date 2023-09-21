<template>
  <div class="container">
    <img class="background" src="background.jpg" />
    <div class="title">
      <div style="text-align: center">Fairy Tale</div>
      <div class="sub-title">인공지능 동화 생성</div>
    </div>
    <div class="content dot">불러오는 중...</div>
    <div></div>
  </div>
</template>
<script setup></script>
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
  font-size: 4rem;
  z-index: 1000;
}
</style>
