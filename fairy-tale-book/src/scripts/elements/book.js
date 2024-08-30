import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { fetchTtsApi } from "../api/api";
import { playAction, playReverseAction } from "../animation/playAction";
import { pubSub } from "../utils/pubsub";
import coverImg from "@/assets/images/cover.jpg";
import pageImg from "@/assets/images/page.jpg";

export default class Book {
    meshes = {};
    #currentPage = 0;
    #animeSpeed = 0.01;
    #audioFile = null;
    #pageR = null;
    #scene;
    #camera;
    #cssRenderer;
    #renderer;
    #gltfLoader;
    #animations;
    #mixer;
    #book;
    #overlayL;
    #overlayR;

    constructor(scene, camera, cssRenderer, gltfLoader, renderer) {
        this.#scene = scene;
        this.#camera = camera;
        this.#cssRenderer = cssRenderer;
        this.#gltfLoader = gltfLoader;
        this.#renderer = renderer;
        this.#audioFile = new Audio();
    }

    async loadBook() {
        return new Promise((resolve) => {
            this.#gltfLoader.load(
                "book.glb",
                function (gltf) {
                    // 텍스쳐 입히기
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                            if (child.name.includes("P")) {
                                let newTexture = null;
                                // page
                                if (child.name.includes("back")) {
                                    newTexture = new THREE.TextureLoader().load(
                                        pageImg
                                    );
                                } else {
                                    newTexture = new THREE.TextureLoader().load(
                                        pageImg
                                    );
                                }
                                child.material.map = newTexture;
                                child.material.needsUpdate = true;
                            } else {
                                const newTexture =
                                    new THREE.TextureLoader().load(coverImg);
                                child.material.map = newTexture;
                                child.material.needsUpdate = true;
                            }
                        }
                    });

                    const book = gltf.scene;

                    // mesh를 배열로 만든다.
                    book.traverse((object) => {
                        if (object instanceof THREE.Mesh) {
                            this.meshes[object.name] = object;
                        }
                    });

                    const animations = gltf.animations;
                    this.#animations = animations;

                    animations.forEach((element) => {
                        this.#animations[element.name] = element;
                    });

                    const scaleFactor = 0.2;
                    book.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    book.position.set(0.45, 0.8, 0.7);

                    book.rotation.y -= Math.PI;

                    book.name = "book";
                    this.#scene.add(book);

                    this.#mixer = new THREE.AnimationMixer(book);

                    let animate = () => {
                        requestAnimationFrame(animate);
                        this.#mixer.update(this.#animeSpeed);
                    };

                    animate();

                    this.#book = book;
                    resolve(book);
                }.bind(this),
                // called while loading is progressing
                null,
                // called when loading has errors
                function (error) {
                    console.log("An error happened", error);
                }
            );
        });
    }

    /**
     * 표지 넘기기
     */
    turnCover() {
        playAction(this.#animations[0], this.#mixer);
        playAction(this.#animations[1], this.#mixer);
        playAction(this.#animations[2], this.#mixer);
        playAction(this.#animations[3], this.#mixer);
    }
    /**
     * 표지 뒤로 넘기기
     */
    turnBackCover() {
        playReverseAction(this.#animations[0], this.#mixer);
        playReverseAction(this.#animations[1], this.#mixer);
        playReverseAction(this.#animations[2], this.#mixer);
        playReverseAction(this.#animations[3], this.#mixer);
    }

    // 책 겉면에 이미지를 삽입한다.
    async createBookCover(images) {
        await this.insertImg(this.meshes.coverL, images[0]);
    }

    async clickCoverFront(images) {
        this.#currentPage = 0;
        this.turnCover();
        await this.insertImg(
            this.meshes.Page1Front,
            images[++this.#currentPage],
            true
        );

        this.createTtsBtnR();
    }

    async clickCoverBack() {
        this.deleteOverlayL();

        this.turnBackCover();
    }

    // if: 만들어진 책을 확인하는 상황
    async clickP1Front(images) {
        this.turnPageFirst();
        await this.insertImg(
            this.meshes.Page1Back,
            images[++this.#currentPage]
        );
        await this.insertImg(
            this.meshes.Page2Front,
            images[++this.#currentPage],
            true
        );
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    async clickP2Front(images) {
        this.tunPageSecond();
        await this.insertImg(
            this.meshes.Page2Back,
            images[++this.#currentPage]
        );
        await this.insertImg(
            this.meshes.Pages,
            images[++this.#currentPage],
            true
        );
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    async clickP3Front(images) {
        // page limit 홀 짝도 계산
        if (images.length < this.#currentPage + 2) {
            return;
        }
        await this.insertImg(
            this.meshes.Page1Back,
            images[this.#currentPage - 1]
        );
        await this.insertImg(
            this.meshes.Page2Front,
            images[this.#currentPage],
            true
        );
        this.tunPageSecond();
        await this.insertImg(
            this.meshes.Page2Back,
            images[++this.#currentPage]
        );
        await this.insertImg(
            this.meshes.Pages,
            images[++this.#currentPage],
            true
        );
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    clickP1Back(images) {
        if (this.#currentPage > 4) {
            this.clickP2Back(images);
            return;
        }
        this.turnBackPageFirst();
        this.#currentPage -= 2;
        this.insertImg(this.meshes.Page1Front, images[this.#currentPage], true);
        this.createTtsBtnR();
        this.deleteOverlayR();
    }

    // todo
    async clickP2Back(images) {
        await this.insertImg(
            this.meshes.Page2Back,
            images[this.#currentPage - 1]
        );
        await this.insertImg(
            this.meshes.Pages,
            images[this.#currentPage],
            true
        );

        this.#currentPage -= 2;
        let clampWhenFinished = true;

        this.turnBackPageSecond(clampWhenFinished);
        this.insertImg(this.meshes.Page1Back, images[this.#currentPage - 1]);
        this.insertImg(this.meshes.Page2Front, images[this.#currentPage], true);
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    /**
     * 첫 번째 페이지 넘기기
     * @param
     * clickedMesh
     */
    turnPageFirst() {
        playAction(this.#animations.Page1Action, this.#mixer);
    }

    /**
     * 이전 페이지로 이동
     */
    turnBackPageFirst() {
        playReverseAction(this.#animations.Page1Action, this.#mixer);
    }

    /**
     * 두 번째 페이지 넘기기
     */
    tunPageSecond() {
        playAction(this.#animations.Page2Action, this.#mixer);
    }

    turnBackPageSecond() {
        playReverseAction(this.#animations.Page2Action, this.#mixer);
    }

    movePositionToLook() {
        this.#book.position.set(0.45, 5, 0.7);
        this.#book.rotation.x = -Math.PI / 2;
    }

    // make book page
    createMakeStoryLayoutOne() {
        const xOffsetL = 0.004;
        const xOffsetR = 0.013;

        this.removeMakeStoryLayout();
        const pageL = document.getElementById("pageL").cloneNode(true);
        pageL.addEventListener("submit", async (e) => {
            e.preventDefault();
            pubSub.publish("getTitles");
        });

        const genreSelectBox = pageL.querySelector("#genre");
        genreSelectBox.addEventListener("change", function () {
            genreSelectBox.blur();
        });

        this.#overlayL = new CSS3DObject(pageL);

        const globalPos = new THREE.Vector3();
        const pagePosL = this.#book.children[7].getWorldPosition(globalPos);
        pagePosL.x += xOffsetL;

        this.#overlayL.position.copy(pagePosL);
        this.#overlayL.rotation.set(-Math.PI / 2, 0, 0);

        this.#overlayL.scale.set(0.0003, 0.0003, 0.0005);

        this.#overlayL.name = "overlayL";
        this.#scene.add(this.#overlayL);

        const pageR = document.getElementById("pageR").cloneNode(true);

        this.#overlayR = new CSS3DObject(pageR);
        const pagePosR = this.#book.children[8].getWorldPosition(globalPos);
        pagePosR.x += xOffsetR;

        this.#overlayR.position.copy(pagePosR);
        this.#overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this.#overlayR.scale.set(0.0003, 0.0003, 0.0005);

        this.#overlayR.name = "overlayR";
        this.#scene.add(this.#overlayR);
    }

    removeMakeStoryLayout() {
        this.deleteOverlayR();
        this.deleteOverlayL();
    }

    createMakeStoryLayoutTwo() {
        const xOffsetL = 0.004;
        const xOffsetR = 0.013;

        const globalPos = new THREE.Vector3();
        const pageL = document.getElementById("loading").cloneNode(true);
        this.#overlayL = new CSS3DObject(pageL);
        const pagePosL = this.#book.children[7].getWorldPosition(globalPos);
        pagePosL.x += xOffsetL;
        this.#overlayL.position.copy(pagePosL);
        this.#overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this.#overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this.#scene.add(this.#overlayL);

        const pageR = document.getElementById("pageR2").cloneNode(true);
        this.#pageR = pageR;
        this.#overlayR = new CSS3DObject(pageR);
        const pagePosR = this.#book.children[8].getWorldPosition(globalPos);
        pagePosR.x += xOffsetR;
        this.#overlayR.position.copy(pagePosR);
        this.#overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this.#overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this.#scene.add(this.#overlayR);
    }

    async createTitlesOnPage(data) {
        this.#scene.remove(this.#overlayL);

        const globalPos = new THREE.Vector3();
        const pageL = document.getElementById("cards").cloneNode(true);
        pageL
            .querySelector(".next-page2")
            .addEventListener("click", async () => {
                pubSub.publish("makeStory");
            });

        this.#overlayL = new CSS3DObject(pageL);
        const pagePosL = this.#book.children[7].getWorldPosition(globalPos);
        this.#overlayL.position.copy(pagePosL);
        this.#overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this.#overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this.#scene.add(this.#overlayL);

        const cardsTitles = pageL.querySelector("#cardsTitles");
        for (let datum of data) {
            const card = document.getElementById("card");
            const clonedElement = card.cloneNode(true);

            let splitedDatum = datum.split(":");
            // 예외 처리
            if (splitedDatum.length === 1) {
                splitedDatum = datum.split("-");
            }
            let title = splitedDatum[0];

            clonedElement.innerText = title;
            cardsTitles.appendChild(clonedElement);

            clonedElement.addEventListener("mouseenter", () => {
                let titleDesc = this.#pageR.querySelector("#titleDesc");
                titleDesc.innerText = datum;
            });
            clonedElement.addEventListener("click", () => {
                let titleSelected = this.#pageR.querySelector("#titleSelected");
                titleSelected.innerText = datum;
            });
        }
    }

    async transitToMakeStoryTwo() {
        this.#scene.remove(this.#overlayR);
        this.#scene.remove(this.#overlayL);

        this.tunPageSecond();

        this.createMakeStoryLayoutTwo();
    }

    createTtsBtnL() {
        const globalPos = new THREE.Vector3();
        const ttsL = document.getElementById("ttsL").cloneNode(true);
        const ttsBtnL = ttsL.querySelector("#ttsBtnL");

        this.#overlayL = new CSS3DObject(ttsL);
        const pagePosL = this.#book.children[8].getWorldPosition(globalPos);
        this.#overlayL.position.copy(pagePosL);
        this.#overlayL.position.z = 0.87;
        this.#overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this.#overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this.#scene.add(this.#overlayL);

        ttsBtnL.addEventListener("click", () => {
            this.fetchTts(this.extractedTexts[this.#currentPage - 1]);
        });
    }

    createTtsBtnR() {
        const globalPos = new THREE.Vector3();

        const ttsR = document.getElementById("ttsR").cloneNode(true);
        const ttsBtnR = ttsR.querySelector("#ttsBtnR");
        this.#overlayR = new CSS3DObject(ttsR);
        const pagePosR = this.#book.children[7].getWorldPosition(globalPos);
        this.#overlayR.position.copy(pagePosR);
        this.#overlayR.position.z = 0.87;

        this.#overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this.#overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this.#scene.add(this.#overlayR);

        ttsBtnR.addEventListener("click", async () => {
            await this.fetchTts(this.extractedTexts[this.#currentPage]);
        });
    }

    deleteOverlayR() {
        this.#scene.remove(this.#overlayL);
    }

    deleteOverlayL() {
        this.#scene.remove(this.#overlayR);
    }

    async fetchTts(text) {
        try {
            const response = await fetchTtsApi(text);
            let audioBase64 = response.data.audioContent;

            let audioBlob = this.base64ToBlob(audioBase64, "mp3");
            this.#audioFile.src = window.URL.createObjectURL(audioBlob);
            this.#audioFile.playbackRate = 1; //재생속도
            this.#audioFile.play();
        } catch (error) {
            console.log(error);
        }
    }

    base64ToBlob(base64, fileType) {
        let mime = "application/" + fileType;
        let b64 = base64.replace(/^[^,]+,/, "");
        let bytes = window.atob(b64);
        let ab = new ArrayBuffer(bytes.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab], {
            type: mime,
        });
    }

    // window에서 사용하기
    speak(text, opt_prop) {
        window.speechSynthesis.cancel(); // 현재 읽고있다면 초기화

        const prop = opt_prop || {};

        const speechMsg = new SpeechSynthesisUtterance();
        speechMsg.rate = prop.rate || 1; // 속도: 0.1 ~ 10
        speechMsg.pitch = prop.pitch || 1; // 음높이: 0 ~ 2
        speechMsg.lang = prop.lang || "ko-KR";
        speechMsg.text = text;

        // SpeechSynthesisUtterance에 저장된 내용을 바탕으로 음성합성 실행
        window.speechSynthesis.speak(speechMsg);
    }

    async insertImg(mesh, image, reverseLeft) {
        return new Promise((resolve) => {
            if (image) {
                new THREE.TextureLoader().load(image, async (texture) => {
                    // 좌우 반전
                    if (reverseLeft) {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.repeat.x = -1;
                    }

                    mesh.material.map = texture;

                    mesh.material.needsUpdate = true;
                    resolve();
                });
            } else {
                mesh.material.map = null;
                mesh.material.needsUpdate = true;
                resolve();
            }
        });
    }
}
