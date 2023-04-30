import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export default class Book {
    constructor(scene, camera, cssRenderer, gltfLoader) {
        this._scene = scene;
        this._camera = camera;
        this._cssRenderer = cssRenderer;
        this._gltfLoader = gltfLoader;
    }

    async loadBook() {
        return new Promise((resolve) => {
            this._gltfLoader.load(
                "bookColor/bookColor.glb",
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
        this._mixer;
        const action = this._mixer.clipAction(this._animations[0]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        action.play();

        const action2 = this._mixer.clipAction(this._animations[1]);
        action2.setLoop(THREE.LoopOnce);
        action2.clampWhenFinished = true;
        action2.enabled = true;
        action2.play();

        const action3 = this._mixer.clipAction(this._animations[2]);
        action3.setLoop(THREE.LoopOnce);
        action3.clampWhenFinished = true;
        action3.enabled = true;
        action3.play();

        const action4 = this._mixer.clipAction(this._animations[3]);
        action4.setLoop(THREE.LoopOnce);
        action4.clampWhenFinished = true;
        action4.enabled = true;
        action4.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.01);
        };

        animate();
    }

    /**
     * 첫 번째 페이지 넘기기
     * @param
     * clickedMesh
     */
    turnPageFirst() {
        const action = this._mixer.clipAction(this._animations[5]);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.enabled = true;
        action.play();

        // const newTexture = new THREE.TextureLoader().load("samplePdf/output-2.jpg");
        // // Assign the new texture to the existing material
        // clickedMesh.material.map = newTexture;
        // clickedMesh.material.needsUpdate = true;

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.01);
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
        action.play();

        let animate = () => {
            requestAnimationFrame(animate);
            this._mixer.update(0.01);
        };
        animate();
    }

    addAura() {
        const auraTexture = this.createAuraTexture();
        const auraMaterial = new THREE.SpriteMaterial({
            map: auraTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        const auraSprite = new THREE.Sprite(auraMaterial);
        auraSprite.scale.set(3.5, 3.5, 3.5); // 원하는 크기로 조절

        this._book.add(auraSprite); // 메쉬에 스프라이트를 자식으로 추가
        auraSprite.position.set(-1, 0, 0); // 원하는 위치에 스프라이트를 놓으세요.

        const animate = (time) => {
            requestAnimationFrame(animate);

            const delta = (Math.sin(time * 0.001) + 1) / 2;
            auraMaterial.opacity = delta * 2;

            this._renderer.render(this._scene, this._camera);
        };

        animate(2000);
    }

    createAuraTexture() {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext("2d");

        const gradient = context.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 2
        );

        gradient.addColorStop(0, "rgba(128, 0, 255, 1)");
        gradient.addColorStop(0.4, "rgba(128, 0, 255, 0.6)");
        gradient.addColorStop(1, "rgba(128, 0, 255, 0)");

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        return new THREE.CanvasTexture(canvas);
    }

    // make book page
    createMakeStoryLayoutOne() {
        const pageL = document.getElementById("pageL");
        const overlay = new CSS3DObject(pageL);

        const globalPos = new THREE.Vector3();
        const pagePosL = this._book.children[7].getWorldPosition(globalPos);

        overlay.position.copy(pagePosL);
        overlay.rotation.set(-Math.PI / 2, 0, 0);

        this._overlay = overlay;
        overlay.scale.set(0.0003, 0.0003, 0.0005);

        this._scene.add(overlay);

        const pageR = document.getElementById("pageR");
        const overlay2 = new CSS3DObject(pageR);
        const pagePosR = this._book.children[8].getWorldPosition(globalPos);
        overlay2.position.copy(pagePosR);
        overlay2.rotation.set(-Math.PI / 2, 0, 0);
        this._overlay2 = overlay2;
        overlay2.scale.set(0.0003, 0.0003, 0.0005);
        this._scene.add(overlay2);
    }

    createImg(clickedMesh, image) {
        console.log(image);
        const newTexture = new THREE.TextureLoader().load(image);
        // Assign the new texture to the existing material
        clickedMesh.material.map = newTexture;
        clickedMesh.material.needsUpdate = true;
    }
}
