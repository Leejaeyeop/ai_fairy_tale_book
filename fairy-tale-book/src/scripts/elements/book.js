import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import axios from "axios";
import { playAction, playReverseAction } from "../animation/playAction";
export default class Book {
    meshes = {};
    _currentPage = 0;
    _animeSpeed = 0.01;
    constructor(scene, camera, cssRenderer, gltfLoader, renderer) {
        this._scene = scene;
        this._camera = camera;
        this._cssRenderer = cssRenderer;
        this._gltfLoader = gltfLoader;
        this._renderer = renderer;
    }

    async loadBook() {
        return new Promise((resolve) => {
            this._gltfLoader.load(
                "book.glb",
                function (gltf) {
                    console.log(gltf.scene);
                    // 텍스쳐 입히기
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                            if (child.name.includes("P")) {
                                let newTexture = null;
                                // page
                                if (child.name.includes("back")) {
                                    newTexture = new THREE.TextureLoader().load("/page4.jpg");
                                } else {
                                    newTexture = new THREE.TextureLoader().load("/page4.jpg");
                                }
                                child.material.map = newTexture;
                                child.material.needsUpdate = true;
                            } else {
                                const newTexture = new THREE.TextureLoader().load("/cover.jpg");
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
                    this._animations = animations;

                    animations.forEach((element) => {
                        this._animations[element.name] = element;
                    });

                    const scaleFactor = 0.2;
                    book.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    book.position.set(0.45, 0.8, 0.7);

                    book.rotation.y -= Math.PI;

                    this._scene.add(book);

                    this._mixer = new THREE.AnimationMixer(book);

                    let animate = () => {
                        requestAnimationFrame(animate);
                        this._mixer.update(this._animeSpeed);
                    };

                    animate();

                    this._book = book;
                    resolve(book);
                }.bind(this),
                // called while loading is progressing
                function (xhr) {
                    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                },
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
        playAction(this._animations[0], this._mixer);
        playAction(this._animations[1], this._mixer);
        playAction(this._animations[2], this._mixer);
        playAction(this._animations[3], this._mixer);
    }
    /**
     * 표지 뒤로 넘기기
     */
    turnBackCover() {
        playReverseAction(this._animations[0], this._mixer);
        playReverseAction(this._animations[1], this._mixer);
        playReverseAction(this._animations[2], this._mixer);
        playReverseAction(this._animations[3], this._mixer);
    }

    // 책 겉면에 이미지를 삽입한다.
    async createBookCover(images) {
        await this.insertImg(this.meshes.coverL, images[0]);
    }

    async clickCoverFront(images) {
        this._currentPage = 0;
        this.turnCover();
        await this.insertImg(this.meshes.Page1Front, images[++this._currentPage], true);

        this.createTtsBtnR();
    }

    async clickCoverBack() {
        this.deleteOverlayL();

        this.turnBackCover();
    }

    // if: 만들어진 책을 확인하는 상황
    async clickP1Front(images) {
        this.turnPageFirst();
        await this.insertImg(this.meshes.Page1Back, images[++this._currentPage]);
        await this.insertImg(this.meshes.Page2Front, images[++this._currentPage], true);
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    async clickP2Front(images) {
        this.tunPageSecond();
        await this.insertImg(this.meshes.Page2Back, images[++this._currentPage]);
        await this.insertImg(this.meshes.Pages, images[++this._currentPage], true);
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    async clickP3Front(images) {
        console.log(images.length);
        console.log(this._currentPage + 1);
        // page limit 홀 짝도 계산
        if (images.length < this._currentPage + 2) {
            return;
        }
        await this.insertImg(this.meshes.Page1Back, images[this._currentPage - 1]);
        await this.insertImg(this.meshes.Page2Front, images[this._currentPage], true);
        this.tunPageSecond();
        await this.insertImg(this.meshes.Page2Back, images[++this._currentPage]);
        await this.insertImg(this.meshes.Pages, images[++this._currentPage], true);
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    clickP1Back(images) {
        if (this._currentPage > 4) {
            this.clickP2Back(images);
            return;
        }
        this.turnBackPageFirst();
        this._currentPage -= 2;
        this.insertImg(this.meshes.Page1Front, images[this._currentPage], true);
        this.createTtsBtnR();
        this.deleteOverlayR();
    }

    // todo
    async clickP2Back(images) {
        await this.insertImg(this.meshes.Page2Back, images[this._currentPage - 1]);
        await this.insertImg(this.meshes.Pages, images[this._currentPage], true);

        this._currentPage -= 2;
        let clampWhenFinished = true;

        this.turnBackPageSecond(clampWhenFinished);
        this.insertImg(this.meshes.Page1Back, images[this._currentPage - 1]);
        this.insertImg(this.meshes.Page2Front, images[this._currentPage], true);
        this.createTtsBtnL();
        this.createTtsBtnR();
    }

    /**
     * 첫 번째 페이지 넘기기
     * @param
     * clickedMesh
     */
    turnPageFirst() {
        playAction(this._animations.Page1Action, this._mixer);
    }

    /**
     * 이전 페이지로 이동
     */
    turnBackPageFirst() {
        playReverseAction(this._animations.Page1Action, this._mixer);
    }

    /**
     * 두 번째 페이지 넘기기
     */
    tunPageSecond() {
        playAction(this._animations.Page2Action, this._mixer);
    }

    turnBackPageSecond() {
        playReverseAction(this._animations.Page2Action, this._mixer);
    }

    movePositionToLook() {
        this._book.position.set(0.45, 5, 0.7);
        this._book.rotation.x = -Math.PI / 2;
        // this._book.rotation.z = -Math.PI;
    }

    // make book page
    createMakeStoryLayoutOne() {
        const xOffsetL = 0.004;
        const xOffsetR = 0.013;

        const pageL = document.getElementById("pageL");
        this._overlayL = new CSS3DObject(pageL);

        const globalPos = new THREE.Vector3();
        const pagePosL = this._book.children[7].getWorldPosition(globalPos);
        pagePosL.x += xOffsetL;

        this._overlayL.position.copy(pagePosL);
        this._overlayL.rotation.set(-Math.PI / 2, 0, 0);

        this._overlayL.scale.set(0.0003, 0.0003, 0.0005);

        this._scene.add(this._overlayL);

        const pageR = document.getElementById("pageR");
        this._overlayR = new CSS3DObject(pageR);
        const pagePosR = this._book.children[8].getWorldPosition(globalPos);
        pagePosR.x += xOffsetR;

        this._overlayR.position.copy(pagePosR);
        this._overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayR);
    }

    removeMakeStoryLayout() {
        this.deleteOverlayR();
        this.deleteOverlayL();
    }

    createMakeStoryLayoutTwo() {
        const xOffsetL = 0.004;
        const xOffsetR = 0.013;

        const globalPos = new THREE.Vector3();
        const pageL = document.getElementById("loading");
        this._overlayL = new CSS3DObject(pageL);
        const pagePosL = this._book.children[7].getWorldPosition(globalPos);
        pagePosL.x += xOffsetL;
        this._overlayL.position.copy(pagePosL);
        this._overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayL);

        const pageR = document.getElementById("pageR2");
        this._overlayR = new CSS3DObject(pageR);
        const pagePosR = this._book.children[8].getWorldPosition(globalPos);
        pagePosR.x += xOffsetR;
        this._overlayR.position.copy(pagePosR);
        this._overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayR);
    }

    async createTitlesOnPage(data) {
        this._scene.remove(this._overlayL);

        const globalPos = new THREE.Vector3();
        const pageL = document.getElementById("cards");
        this._overlayL = new CSS3DObject(pageL);
        const pagePosL = this._book.children[7].getWorldPosition(globalPos);
        this._overlayL.position.copy(pagePosL);
        this._overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayL);

        const cardsTitles = document.getElementById("cardsTitles");
        for (let datum of data) {
            const card = document.getElementById("card");
            const clonedElement = card.cloneNode(true);
            clonedElement.innerText = datum.split(":")[0];
            cardsTitles.appendChild(clonedElement);

            clonedElement.addEventListener("mouseenter", () => {
                let titleDesc = document.getElementById("titleDesc");
                titleDesc.innerText = datum;
            });
            clonedElement.addEventListener("click", () => {
                let titleSelected = document.getElementById("titleSelected");
                titleSelected.innerText = datum;
            });
        }
    }

    async transitToMakeStoryTwo() {
        this._scene.remove(this._overlayR);
        this._scene.remove(this._overlayL);

        this.tunPageSecond();

        this.createMakeStoryLayoutTwo();
    }

    createTtsBtnL() {
        const globalPos = new THREE.Vector3();
        const ttsL = document.getElementById("ttsL").cloneNode(true);
        console.log(ttsL);
        const ttsBtnL = ttsL.querySelector("#ttsBtnL");

        this._overlayL = new CSS3DObject(ttsL);
        const pagePosL = this._book.children[8].getWorldPosition(globalPos);
        this._overlayL.position.copy(pagePosL);
        this._overlayL.position.z = 0.87;
        this._overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayL);

        ttsBtnL.addEventListener("click", () => {
            this.fetchTts(this.extractedTexts[this._currentPage - 1]);
        });
    }

    createTtsBtnR() {
        const globalPos = new THREE.Vector3();

        const ttsR = document.getElementById("ttsR").cloneNode(true);
        const ttsBtnR = ttsR.querySelector("#ttsBtnR");
        this._overlayR = new CSS3DObject(ttsR);
        const pagePosR = this._book.children[7].getWorldPosition(globalPos);
        this._overlayR.position.copy(pagePosR);
        this._overlayR.position.z = 0.87;

        this._overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayR);

        ttsBtnR.addEventListener("click", () => {
            console.log("book!");

            this.fetchTts(this.extractedTexts[this._currentPage]);
        });
    }

    deleteOverlayR() {
        this._scene.remove(this._overlayL);
    }

    deleteOverlayL() {
        this._scene.remove(this._overlayR);
    }

    fetchTts(text) {
        let data = JSON.stringify({
            voice: {
                languageCode: "ko-KR",
                ssmlGender: "FEMALE",
                name: "ko-KR-Wavenet-A", // Specify the voice
            },
            input: {
                text: text,
            },
            audioConfig: {
                audioEncoding: "mp3",
            },
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCKiq248cQRH-p3lGwK0SgGOdKFKw7dt0Q",
            headers: {
                "Content-Type": "application/json",
            },
            data: data,
        };

        axios
            .request(config)
            .then((response) => {
                let audioBase64 = response.data.audioContent;
                var audioFile = new Audio();
                let audioBlob = this.base64ToBlob(audioBase64, "mp3");
                audioFile.src = window.URL.createObjectURL(audioBlob);
                audioFile.playbackRate = 1; //재생속도
                audioFile.play();
            })
            .catch((error) => {
                console.log(error);
            });
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
        console.log(mesh);
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
