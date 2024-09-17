<template>
    <div id="cssObjects">
        <form class="page" id="pageL">
            <div class="input">
                이야기 주인공의 이름은?
                <input id="mainCharacter" placeholder="이름을 입력해주세요!" required pattern=".{1,30}" />
            </div>
            <div class="input">
                이야기의 장르를 선택해 주세요!
                <select id="genre">
                    <option v-for="genre of genres" :key="genre" :value="genre">
                        {{ genre }}
                    </option>
                </select>
            </div>
            <button class="next-page" style="text-align: right; width: 100%" type="submit">
                <p>다음으로 이동 -></p>
            </button>
        </form>
        <div class="page dot center" id="loading">
            <p>잠시만 기다려 주세요!</p>
            <video autoplay loop muted playsinline>
                <source :src="require('../assets/images/loading.webm')" type="video/webm" />
            </video>
        </div>

        <div class="page" id="pageR">
            <div>
                <h1>당신의 이야기를 만들어 주세요!</h1>
                <h2>이야기 주인공의 이름과 주제를 선택해 주세요.</h2>
            </div>
        </div>
        <div class="page" id="pageR2">
            <p>주제를 골라 주세요!</p>
            <div id="titleDesc" class="title-card"></div>
            <div>
                선택된 이야기
                <div id="titleSelected" class="title-card-border title-card"></div>
            </div>
        </div>

        <div class="page" id="cards">
            <div id="cardsTitles"></div>
            <div class="next-page2" style="text-align: right; width: 100%">
                <p>다음으로 이동 -></p>
            </div>
        </div>
        <div id="card" class="card">
            <p class="mt-2 text-gray-600"></p>
        </div>

        <div id="ttsR">
            <button id="ttsBtnR">
                <i class="fas fa-volume-up fa-4x"></i>
            </button>
        </div>

        <div id="ttsL">
            <button id="ttsBtnL">
                <i class="fas fa-volume-up fa-4x"></i>
            </button>
        </div>

        <div id="arrow-start" class="arrow">
            <div class="arrow-tail"></div>
            <div class="arrow-head"></div>
        </div>

        <div id="arrow-load" class="arrow">
            <div class="arrow-tail"></div>
            <div class="arrow-head"></div>
        </div>

        <div class="hover_frame" id="desk_frame_front"></div>
        <div class="hover_frame" id="desk_frame_top"></div>

        <div id="start">
            <div id="circle"></div>
            <h1 class="intro_text">이야기 만들기</h1>
        </div>
        <div class="hover_frame" id="bookshelf_frame_front"></div>
        <div class="hover_frame" id="bookshelf_frame_side"></div>
        <div id="load">
            <div id="circle"></div>
            <h1 class="intro_text">이야기 불러오기</h1>
            <input type="file" id="pdfUpload" accept=".pdf" style="display: none; important" />
        </div>
        <div id="making_story_title">
            <div id="making_story_title_text">
                <h1>잠시만 기다려 주세요! . . . 최대 3분이 소요 됩니다.</h1>
            </div>
            <div id="making_story_title_steps">
                <div id="making_story_title_step1" class="making_story_title_step">1. 이야기 생성</div>
                <div class="making_story_title_step">-></div>
                <div id="making_story_title_step2" class="making_story_title_step">2. 그림 생성</div>
                <div class="making_story_title_step">-></div>
                <div id="making_story_title_step3" class="making_story_title_step">3. pdf 생성</div>
            </div>
            <div>
                <video id="making_story_video" autoplay loop muted playsinline>
                    <source id="making_story_img" src="story.webm" type="video/webm" />
                </video>
            </div>

            <div id="making_story_title_sub_text" class="dot">
                <h1>이야기를 만들고 있어요!</h1>
            </div>
        </div>
    </div>
</template>
<script setup>
const genres = ["외국 전래동화", "해외 전래동화", "아무거나", "모험", "동물", "도전", "우정"];
</script>
<style>
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
}

option {
    font-family: "InkLipquid";
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
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

h1,
input,
select,
#making_story_title {
    font-family: "InkLipquid";
    font-weight: 700;
    font-size: 3rem;
}

select {
    width: 12.5rem;
    height: 4.5rem;
}

select:focus {
    font-size: 1rem;
}

h2 {
    font-size: 2rem;
}
@font-face {
    font-family: "InkLipquid";
    font-display: swap;
    src: url("@/assets/fonts/InkLipquidFonts.ttf") format("truetype");
}

.circle {
    width: 100%;
    height: 100%;
    /* 추가된 부분 */
    animation: scale1 2s alternate;
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
}

.arrow-head {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid white;
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

#cssObjects div {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
}

#making_story_title > div {
    position: relative;
    display: block;
}

#making_story_title_steps {
    display: flex !important;
    flex-direction: row;
    justify-content: center;
    width: 80%;
}

.making_story_title_step {
    color: black;
    position: relative !important;
    display: block !important;
    text-align: center;
    margin-right: 2rem;
}

.current_step {
    color: white;
}

.next-page,
.next-page2 {
    cursor: pointer;
}

#three {
    position: relative;
}
.input {
    text-align: center;
}
.title-card-border {
    border: 2px solid black;
}
.title-card {
    max-height: 30rem;
    overflow-y: auto;
}
.card {
    padding: 2rem;
    margin-bottom: 2rem;
}
.center {
    justify-content: center;
}
#mainCharacter,
#genre {
    border: 1px solid;
}
</style>
