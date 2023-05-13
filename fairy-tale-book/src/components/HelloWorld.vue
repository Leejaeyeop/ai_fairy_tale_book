<template>
    <div style="position: relative">
        <div
            id="three"
            class="hello"
        ></div>

        <div id="htmls">
            <div
                class="page"
                id="pageL"
            >
                <div class="input">
                    이야기 주인공의 이름은?
                    <input
                        id="mainCharacter"
                        placeholder="이름을 입력해주세요!"
                    />
                </div>
                <div class="input">
                    이야기의 장르를 선택해 주세요!
                    <select id="genre">
                        <option value="아무거나">아무거나</option>
                        <option value="모험">모험</option>
                        <option value="동물">동물</option>
                        <option value="다양성">다양성</option>
                        <option value="가족">가족</option>
                        <option value="도전">도전</option>
                        <option value="우정">우정</option>
                    </select>
                </div>
                <!-- <div class="input">
                    이야기의 페이지 수를 선택해 주세요!
                    <select id="pageCount">
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="13">13</option>
                        <option value="14">14</option>
                    </select>
                </div> -->
                <div
                    id="next-page"
                    style="text-align: right; width: 100%"
                >
                    <p>다음으로 이동 -></p>
                </div>
            </div>
            <div
                class="page dot center"
                id="loading"
            >
                잠시만 기다려 주세요!
            </div>

            <div
                class="page"
                id="pageR"
            >
                <div>
                    <h1>당신의 이야기를 만들어 주세요!</h1>
                    <h2>이야기 주인공의 이름과 주제를 선택해 주세요.</h2>
                </div>
            </div>
            <div
                class="page"
                id="pageR2"
            >
                <p>주제를 골라 주세요!</p>
                <div id="titleDesc"></div>
                <div>
                    선택된 이야기
                    <div
                        id="titleSelected"
                        class="title-card"
                    ></div>
                </div>
            </div>

            <div
                class="page"
                id="cards"
            >
                <div id="cardsTitles"></div>
                <div
                    id="next-page2"
                    style="text-align: right; width: 100%"
                >
                    <p>다음으로 이동 -></p>
                </div>
            </div>
            <div
                id="card"
                class="card"
            >
                <p class="mt-2 text-gray-600">
                    <!-- 1. 장난감 소년 : 장난감 소년은 자신의 친구들과 함께 장난감 마을에 방문하여 여러 장난감들과 놀이를
                    하며 즐거운 시간을 보냈습니다. 그러던 중 장난감 마 을의 왕자가 되기 위해 장난감 소년은 여러
                    장난감들과 함께 모험을 떠나게 됩니다. -->
                </p>
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
            <div id="making_story_title">
                <h1
                    id="making_story_title_text"
                    class="dot"
                    style="display: inline"
                >
                    이야기를 만들고 있어요. 잠시만 기다려 주세요! . . .
                </h1>
            </div>
        </div>
    </div>
</template>

<script setup>
import Main from "@/module/function/main.three";
import { onMounted } from "vue";

onMounted(() => {
    new Main();
});
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
    width: 800px;
    height: 1000px;
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

#making_story_title {
    color: white;
    margin-top: 10%;
    width: 100%;
    text-align: center;
    position: absolute;
}

h1,
input,
select,
#making_story_title {
    font-family: "InkLipquid";
    font-weight: 700;
    font-size: 3rem;
}

h2 {
    font-size: 2rem;
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

@keyframes dotAnimation {
    0%,
    25% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    75%,
    100% {
        opacity: 1;
    }
}

.dot {
    animation: dotAnimation 1.5s infinite alternate;
}

#htmls div {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
}

#next-page,
#next-page2 {
    cursor: pointer;
}

#three {
    position: relative;
}
.input {
    text-align: center;
}
.title-card {
    border: 2px solid black;
}
.card {
    padding: 2rem;
    margin-bottom: 2rem;
}
.center {
    justify-content: center;
}
</style>
