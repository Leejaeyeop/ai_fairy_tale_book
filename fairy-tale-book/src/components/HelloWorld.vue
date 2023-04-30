<template>
    <div
        id="three"
        class="hello"
    ></div>
    <div
        class="page"
        id="pageL"
    >
        <div>이야기 주인공의 이름은?</div>
        <div>
            <!-- <div> -->
            <input placeholder="test1" />
        </div>
        <!-- <div> 이름을 선택하세요</div>
    <div>
      <input placeholder="test2">
    </div>
    <div> 골라주세요</div>
    <div>
      <input placeholder="test3">
    </div> -->
    </div>

    <div
        id="arrow-start"
        class="arrow"
    >
        <div class="arrow-tail"></div>
        <div class="arrow-head"></div>
    </div>

    <div
        id="arrow-load"
        class="arrow"
    >
        <div class="arrow-tail"></div>
        <div class="arrow-head"></div>
    </div>

    <div
        class="page"
        id="pageR"
    >
        <h1>당신의 이야기를 만들어 주세요!</h1>
    </div>
    <div
        class="hover_frame"
        id="desk_frame_front"
    ></div>
    <div
        class="hover_frame"
        id="desk_frame_top"
    ></div>
    <div id="start">
        <div id="circle"></div>
        <h1 class="intro_text">이야기 만들기</h1>
    </div>
    <div
        class="hover_frame"
        id="bookshelf_frame_front"
    ></div>
    <div
        class="hover_frame"
        id="bookshelf_frame_side"
    ></div>
    <div id="load">
        <div id="circle"></div>
        <h1 class="intro_text">이야기 불러오기</h1>
    </div>
</template>

<script>
import Main from "@/module/function/main.three";
// import { Configuration, OpenAIApi } from "openai";
export default {
    name: "HelloWorld",
    props: {
        msg: String,
    },
    mounted() {
        new Main();
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
.page {
    position: absolute;
    width: 60%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    font-family: "InkLipquid";
    font-weight: 700;
    font-size: 3rem;
    /* font-family: 'NanumGaRamYeonGgoc';
  src: url('@/assets/fonts/garam.ttf') format('ttf'); */

    /* transform-origin: top left; */
    /* transform: translateX(10px) translateY(20px) scaleX(0.5) scaleY(0.5); */
}
.intro_text {
    color: beige;
    z-index: 1;
    position: relative;
}
h1,
input {
    font-family: "InkLipquid";
    font-weight: 700;
    font-size: 3rem;
}
@font-face {
    font-family: "InkLipquid";
    src: url("@/assets/fonts/InkLipquidFonts.ttf") format("truetype");
}
.circle {
    width: 100%;
    height: 100%;
    /* top: 80px;
  left: 80px; */
    /* 추가된 부분 */
    animation: scale1 2s alternate;
    /* animation: scale1 2s alternate infinite; */
    position: absolute;
    background: #000000;
    border-radius: 50%;
    box-shadow: 7px 7px 10px 1px rgba(0, 0, 0, 0.5);
    z-index: 0;
    cursor: pointer;
}

@keyframes scale1 {
    0% {
        transform: scale(0);
    }
    100% {
        transform: scale(1);
    }
}

#start,
#load {
    width: 15rem;
    height: 15rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.arrow {
    display: inline-flex;
    align-items: center;
}

.arrow-tail {
    width: 1rem;
    height: 0.2rem;
    background-color: white;
    /* animation: moveLeftAndBack 2s ease infinite; */
}

.arrow-head {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid white;
    /* animation: moveLeftAndBack 2s ease infinite; */
}

@keyframes moveLeftAndBack {
    0%,
    100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(-2rem);
    }
}

.hover_frame {
    /* background-color: white; */
    width: 1rem;
    height: 1rem;
    cursor: pointer;
}
</style>
