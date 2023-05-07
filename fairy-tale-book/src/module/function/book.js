import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
export default class Book {
    meshes = {};
    _currentPage = 0;

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
                "bookColor/book.glb",
                function (gltf) {
                    // 텍스쳐 입히기
                    // coverL의 cover-front에만 texture를 입힘
                    // gltf.scene.children[2].children[0].traverse(function (child) {
                    // gltf.scene.traverse(function (child) {
                    //     if (child.isMesh) {
                    //       // Create a new texture to replace the UV-mapped texture
                    //       const newTexture = new THREE.TextureLoader().load('/book-cover-image.jpg');
                    //       // Assign the new texture to the existing material
                    //       child.material.map = newTexture;
                    //       child.material.needsUpdate = true;

                    //     }
                    //   });

                    const book = gltf.scene;

                    // mesh를 배열로 만든다.
                    book.traverse((object) => {
                        if (object instanceof THREE.Mesh) {
                            this.meshes[object.name] = object;
                            // meshes.push(object);
                        }
                    });

                    const animations = gltf.animations;
                    this._animations = animations;
                    console.log(this._animations);

                    const scaleFactor = 0.2;
                    book.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    book.position.set(0.45, 0.8, 0.7);

                    book.rotation.y -= Math.PI;

                    this._scene.add(book);

                    this._mixer = new THREE.AnimationMixer(book);
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
        const action = this._mixer.clipAction(this._animations[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        action.timeScale = 1;
        action.paused = false;
        action.reset();
        action.play();

        const action2 = this._mixer.clipAction(this._animations[1]);
        action2.setLoop(THREE.LoopOnce);
        action2.clampWhenFinished = true;
        action2.enabled = true;
        action2.timeScale = 1;
        action2.paused = false;
        action2.reset();
        action2.play();

        const action3 = this._mixer.clipAction(this._animations[2]);
        action3.setLoop(THREE.LoopOnce);
        action3.clampWhenFinished = true;
        action3.enabled = true;
        action3.timeScale = 1;
        action3.paused = false;
        action3.reset();
        action3.play();

        const action4 = this._mixer.clipAction(this._animations[3]);
        action4.setLoop(THREE.LoopOnce);
        action4.clampWhenFinished = true;
        action4.enabled = true;
        action4.timeScale = 1;
        action4.paused = false;
        action4.reset();
        action4.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.01);
        };

        animate();
    }
    /**
     * 표지 넘기기
     */
    turnBackCover() {
        const action = this._mixer.clipAction(this._animations[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;

        action.paused = false;
        action.time = action.getClip().duration;
        action.timeScale = -1;
        action.play();

        const action2 = this._mixer.clipAction(this._animations[1]);
        action2.setLoop(THREE.LoopOnce);
        action2.clampWhenFinished = true;
        action2.enabled = true;

        action2.paused = false;
        action2.time = action2.getClip().duration;
        action2.timeScale = -1;
        action2.play();

        const action3 = this._mixer.clipAction(this._animations[2]);
        action3.setLoop(THREE.LoopOnce);
        action3.clampWhenFinished = true;
        action3.enabled = true;

        action3.paused = false;
        action3.time = action3.getClip().duration;
        action3.timeScale = -1;
        action3.play();

        const action4 = this._mixer.clipAction(this._animations[3]);
        action4.setLoop(THREE.LoopOnce);
        action4.clampWhenFinished = true;
        action4.enabled = true;

        action4.paused = false;
        action4.time = action4.getClip().duration;
        action4.timeScale = -1;
        action4.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.01);
        };

        animate();
    }

    // animateP1Turn(reverse) {}

    // animateP2Turn(reverse) {}

    async clickCoverFront(images) {
        this._currentPage = 0;
        this.turnCover();
        await this.insertImg(this.meshes.P1front, images[++this._currentPage]);
    }

    // if: 만들어진 책을 확인하는 상황
    async clickP1Front(images) {
        this.turnPageFirst();
        await this.insertImg(this.meshes.P1back, images[++this._currentPage]);
        await this.insertImg(this.meshes.P2front, images[++this._currentPage]);
    }

    async clickP2Front(images) {
        this.tunPageSecond();
        await this.insertImg(this.meshes.P2back, images[++this._currentPage]);
        await this.insertImg(this.meshes.P3front, images[++this._currentPage]);
    }

    async clickP3Front(images) {
        console.log(images.length);
        console.log(this._currentPage + 1);
        // page limit 홀 짝도 계산
        if (images.length < this._currentPage + 1) {
            return;
        }
        await this.insertImg(this.meshes.P1back, images[this._currentPage - 1]);
        await this.insertImg(this.meshes.P2front, images[this._currentPage]);
        this.tunPageSecond();
        await this.insertImg(this.meshes.P2back, images[++this._currentPage]);
        await this.insertImg(this.meshes.P3front, images[++this._currentPage]);
    }

    // clickCoverBack(images) {

    // }

    clickP1Back(images) {
        if (this._currentPage > 3) {
            this.clickP2Back(images);
            return;
        }
        this.turnBackPageFirst();
        this._currentPage -= 2;
        this.insertImg(this.meshes.P1front, images[this._currentPage]);
    }

    // todo
    async clickP2Back(images) {
        await this.insertImg(this.meshes.P2back, images[this._currentPage - 1]);
        await this.insertImg(this.meshes.P3front, images[this._currentPage]);

        this._currentPage -= 2;
        let clampWhenFinished = true;

        // if (this._currentPage > 3) {
        //     // 원복
        //     clampWhenFinished = true;
        //     // todo 에니메이션 종료후 바뀜
        //     this.insertImg(this.meshes.P2back, images[this._currentPage - 1]);
        //     this.insertImg(this.meshes.P3front, images[this._currentPage]);
        // }
        this.turnBackPageSecond(clampWhenFinished);
        this.insertImg(this.meshes.P1back, images[this._currentPage - 1]);
        this.insertImg(this.meshes.P2front, images[this._currentPage]);
    }

    /**
     * 첫 번째 페이지 넘기기
     * @param
     * clickedMesh
     */
    turnPageFirst() {
        let action = this._mixer.clipAction(this._animations[5]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        action.paused = false;
        action.timeScale = 1;
        // reset시 필요
        action.reset();
        action.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.001);
        };

        animate();
    }

    /**
     * 이전 페이지로 이동
     */
    turnBackPageFirst() {
        let action = this._mixer.clipAction(this._animations[5]);
        action.paused = false;
        action.time = action.getClip().duration;
        action.timeScale = -1;
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        // reset시 필요
        // action.reset();
        action.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.001);
        };

        animate();
    }

    /**
     * 두 번째 페이지 넘기기
     */
    tunPageSecond() {
        const action = this._mixer.clipAction(this._animations[7]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        action.paused = false;
        action.timeScale = 1;
        // reset시 필요
        action.reset();
        action.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.001);
        };

        animate();
    }

    turnBackPageSecond() {
        let action = this._mixer.clipAction(this._animations[7]);
        action.paused = false;
        action.time = action.getClip().duration;
        action.timeScale = -1;
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        // reset시 필요
        // action.reset();
        action.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.001);
        };

        animate();
    }

    movePositionToLook() {
        this._book.position.set(0.45, 5, 0.7);
        this._book.rotation.x = -Math.PI / 2;
        // this._book.rotation.z = -Math.PI;
    }

    // make book page
    createMakeStoryLayoutOne() {
        const pageL = document.getElementById("pageL");
        this._overlayL = new CSS3DObject(pageL);

        const globalPos = new THREE.Vector3();
        const pagePosL = this._book.children[7].getWorldPosition(globalPos);

        this._overlayL.position.copy(pagePosL);
        this._overlayL.rotation.set(-Math.PI / 2, 0, 0);

        this._overlayL.scale.set(0.0003, 0.0003, 0.0005);

        this._scene.add(this._overlayL);

        const pageR = document.getElementById("pageR");
        this._overlayR = new CSS3DObject(pageR);
        const pagePosR = this._book.children[8].getWorldPosition(globalPos);
        this._overlayR.position.copy(pagePosR);
        this._overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayR);

        console.log(this._overlayR.element);
    }

    removeMakeStoryLayout() {
        this._scene.remove(this._overlayL);
        this._scene.remove(this._overlayR);
    }

    createMakeStoryLayoutTwo() {
        const globalPos = new THREE.Vector3();
        const pageL = document.getElementById("loading");
        this._overlayL = new CSS3DObject(pageL);
        const pagePosL = this._book.children[7].getWorldPosition(globalPos);
        this._overlayL.position.copy(pagePosL);
        this._overlayL.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayL.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayL);

        const pageR = document.getElementById("pageR2");
        this._overlayR = new CSS3DObject(pageR);
        const pagePosR = this._book.children[8].getWorldPosition(globalPos);
        this._overlayR.position.copy(pagePosR);
        this._overlayR.rotation.set(-Math.PI / 2, 0, 0);
        this._overlayR.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(this._overlayR);
    }

    async createTitlesOnPage(data) {
        console.log(data);
        // data = [
        //     "1. 백설공주와 일곱 난쟁이: 이재엽이 백설공주를 도와 일곱 난쟁이를 찾아내는 모험을 떠나는 이야기. 이재엽은 마녀를 잡고 난쟁이들을 찾아내는 데 성공하고, 마녀를 잡고 백설공주를 구하는 데 성공합니다.",
        //     "2. 신데렐라: 이재엽이 신데렐라를 도와 자신의 운명을 바꾸는 모험을 떠나는 이야기. 이재엽은 신데렐라를 도와 자신의 운명을 바꾸고, 마녀를 잡고 신데렐라를 구하는 데 성공합니다.",
        //     "3. 아리아와 마법의 사슴: 이재엽이 아리아를 도와 마법의 사슴을 찾아내는 모험을 떠나는 이야기. 이재엽은 아리아를 도와 마법의 사슴을 찾아내고, 마녀를 잡고 아리아를 구하는 데 성공합니다.",
        //     "4. 잉카와 마법의 장미: 이재엽이 잉카를 도와 마법의 장미를 찾아내는 모험을 떠나는 이야기. 이재엽은 잉카를 도와 마법의 장미를 찾아내고, 마녀를 잡고 잉카를 구하는 데 성공합니다.",
        //     "5. 잭과 마법의 바구니: 이재엽이 잭을 도와 마법의 바구니를 찾아내는 모험을 떠나는 이야기. 이재엽은 잭을 도와 마법의 바구니를 찾아내고, 마녀를 잡고 잭을 구하는 데 성공합니다.",
        // ];
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

    async insertImg(mesh, image) {
        return new Promise((resolve) => {
            if (image) {
                const newTexture = new THREE.TextureLoader().load(image, async () => {
                    mesh.material.map = newTexture;
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
