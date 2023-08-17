import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { pubSub } from "../utils/pubsub";
export default class Intro {
    #scene;
    #camera;
    #renderer;
    #cssRenderer;
    #loadOverlay;
    #loadPonterOverlay;
    #startOverlay;
    #startPonterOverlay;
    #deskFrameFront;
    #deskFrameOverlay;
    #deskFrameTop;
    #deskFrameTopOverlay;
    #bookshelfFrameFront;
    #bookshelfFrameFrontOverlay;
    #bookshelfFrameSide;
    #bookshelfFrameSideOverlay;

    constructor(scene, camera, renderer, cssRenderer) {
        this.#scene = scene;
        this.#camera = camera;
        this.#renderer = renderer;
        this.#cssRenderer = cssRenderer;
        this.init();
    }

    init() {
        const load = document.getElementById("load");
        const loadOverlay = new CSS3DObject(load);
        this.#loadOverlay = loadOverlay;
        loadOverlay.position.set(-0.2, 1, 3);
        loadOverlay.rotation.set(0, Math.PI / 4, 0);
        loadOverlay.scale.set(0.004, 0.004, 0.006);

        const loadPonter = document.getElementById("arrow-load");
        const loadPonterOverlay = new CSS3DObject(loadPonter);
        this.#loadPonterOverlay = loadPonterOverlay;
        loadPonterOverlay.position.set(-0.5, 1.9, 3.4);
        loadPonterOverlay.rotation.set(-Math.PI / 3, Math.PI / 3, 0);
        loadPonterOverlay.scale.set(0.01, 0.01, 0.01);

        const start = document.getElementById("start");
        const startOverlay = new CSS3DObject(start);
        this.#startOverlay = startOverlay;
        startOverlay.position.set(0.45, 0.8, 0.7);
        startOverlay.scale.set(0.004, 0.004, 0.006);

        startOverlay.lookAt(this.#camera.position);

        const startPonter = document.getElementById("arrow-start");
        const startPonterOverlay = new CSS3DObject(startPonter);
        this.#startPonterOverlay = startPonterOverlay;
        startPonterOverlay.position.set(0.45, 1.1, 0.7);
        startPonterOverlay.rotation.set(0, 0, -Math.PI / 2);
        startPonterOverlay.scale.set(0.008, 0.008, 0.008);

        this.#cssRenderer.render(this.#scene, this.#camera);

        const deskFrameFront = document.getElementById("desk_frame_front");
        this.#deskFrameFront = deskFrameFront;
        const deskFrameOverlay = new CSS3DObject(deskFrameFront);
        this.#deskFrameOverlay = deskFrameOverlay;
        deskFrameOverlay.position.set(0.35, 0.45, 1);
        deskFrameOverlay.scale.set(0.13, 0.07, 0.1);

        const deskFrameTop = document.getElementById("desk_frame_top");
        this.#deskFrameTop = deskFrameTop;
        const deskFrameTopOverlay = new CSS3DObject(deskFrameTop);
        this.#deskFrameTopOverlay = deskFrameTopOverlay;
        deskFrameTopOverlay.position.set(0.35, 0.6, 0.7);
        deskFrameTopOverlay.rotation.set(Math.PI / 2, 0, 0);
        deskFrameTopOverlay.scale.set(0.13, 0.06, 0.1);

        const bookshelfFrameFront = document.getElementById("bookshelf_frame_front");
        this.#bookshelfFrameFront = bookshelfFrameFront;
        const bookshelfFrameFrontOverlay = new CSS3DObject(bookshelfFrameFront);
        this.#bookshelfFrameFrontOverlay = bookshelfFrameFrontOverlay;
        bookshelfFrameFrontOverlay.position.set(-0.18, 1, 3);
        bookshelfFrameFrontOverlay.rotation.set(0, Math.PI / 4, 0);
        bookshelfFrameFrontOverlay.scale.set(0.05, 0.15, 0.1);

        const bookshelfFrameSide = document.getElementById("bookshelf_frame_side");
        this.#bookshelfFrameSide = bookshelfFrameSide;
        const bookshelfFrameSideOverlay = new CSS3DObject(bookshelfFrameSide);
        this.#bookshelfFrameSideOverlay = bookshelfFrameSideOverlay;
        bookshelfFrameSideOverlay.position.set(-0.44, 1, 3);
        bookshelfFrameSideOverlay.rotation.set(0, -Math.PI / 4, 0);
        bookshelfFrameSideOverlay.scale.set(0.03, 0.15, 0.1);

        this.setHoveringListener();
        this.addScene();

        // Animation variables
        const amplitude = 0.1; // The distance to move to the right and back
        const period = 2000; // The duration of one full right and back motion in milliseconds
        let startTime = Date.now();
        const animate = () => {
            requestAnimationFrame(animate);

            // Calculate elapsed time
            const elapsedTime = Date.now() - startTime;
            const progress = (elapsedTime % period) / period;

            // Calculate the new Z position using a combination of sine and cosine functions
            const zPos = (amplitude * (1 - Math.cos(progress * 2 * Math.PI))) / 2;
            // Update the Mesh object's position
            loadPonterOverlay.position.z = 3.4 - zPos;
            loadPonterOverlay.position.y = 1.9 - zPos;

            startPonterOverlay.position.y = 1.1 - zPos;
            this.#cssRenderer.render(this.#scene, this.#camera);
        };
        animate();
    }

    // Animation function
    animateCamera(startPosition, endPosition, startRotation, endRotation, duration, easing) {
        const startTime = performance.now();
        const start = startPosition.clone();
        const end = endPosition.clone();
        const diffPosition = end.clone().sub(start);
        const startQuaternion = startRotation.clone();
        const endQuaternion = endRotation.clone();
        const quaternion = new THREE.Quaternion();

        const move = (timestamp) => {
            const elapsedTime = timestamp - startTime;
            const progress = elapsedTime / duration;

            if (progress < 1) {
                const easedProgress = easing(progress);
                const currentPosition = start.clone().add(diffPosition.clone().multiplyScalar(easedProgress));
                quaternion.slerpQuaternions(startQuaternion, endQuaternion, easedProgress);
                this.#camera.position.copy(currentPosition);
                this.#camera.setRotationFromQuaternion(quaternion);
                this.#renderer.render(this.#scene, this.#camera);
                requestAnimationFrame(move);
            } else {
                this.#camera.position.copy(end);
                this.#camera.setRotationFromQuaternion(endQuaternion);
                this.#renderer.render(this.#scene, this.#camera);
            }
        };

        requestAnimationFrame(move);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    addScene() {
        this.#scene.add(this.#loadOverlay);
        this.#scene.add(this.#loadPonterOverlay);
        this.#scene.add(this.#bookshelfFrameFrontOverlay);
        this.#scene.add(this.#bookshelfFrameSideOverlay);
        this.#scene.add(this.#startOverlay);
        this.#scene.add(this.#startPonterOverlay);
        this.#scene.add(this.#deskFrameOverlay);
        this.#scene.add(this.#deskFrameTopOverlay);
    }

    removeScene() {
        this.#scene.remove(this.#loadOverlay);
        this.#scene.remove(this.#loadPonterOverlay);
        this.#scene.remove(this.#bookshelfFrameFrontOverlay);
        this.#scene.remove(this.#bookshelfFrameSideOverlay);
        this.#scene.remove(this.#startOverlay);
        this.#scene.remove(this.#startPonterOverlay);
        this.#scene.remove(this.#deskFrameOverlay);
        this.#scene.remove(this.#deskFrameTopOverlay);
    }

    setHoveringListener() {
        this.#bookshelfFrameFront.addEventListener("mouseenter", () => {
            let el = this.#loadOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this.#bookshelfFrameFront.addEventListener("mouseleave", () => {
            let el = this.#loadOverlay.element.querySelector("#circle");
            el.className = "";
        });

        this.#bookshelfFrameSide.addEventListener("mouseenter", () => {
            let el = this.#loadOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this.#bookshelfFrameSide.addEventListener("mouseleave", () => {
            let el = this.#loadOverlay.element.querySelector("#circle");
            el.className = "";
        });

        this.#deskFrameFront.addEventListener("mouseenter", () => {
            let el = this.#startOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this.#deskFrameFront.addEventListener("mouseleave", () => {
            let el = this.#startOverlay.element.querySelector("#circle");
            el.className = "";
        });
        this.#deskFrameTop.addEventListener("mouseenter", () => {
            let el = this.#startOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this.#deskFrameTop.addEventListener("mouseleave", () => {
            let el = this.#startOverlay.element.querySelector("#circle");
            el.className = "";
        });

        // 이야기 만들기
        this.#deskFrameFront.addEventListener("click", () => {
            this.zoomCameraToLook();

            pubSub.publish("beginScene2");
        });

        this.#deskFrameTop.addEventListener("click", () => {
            pubSub.publish("beginScene2");
        });

        // 이야기 불러오기
        this.#bookshelfFrameFront.addEventListener("click", () => {
            this.fileUpload();
        });

        this.#bookshelfFrameSide.addEventListener("click", () => {
            const startPosition = this.#camera.position;
            const endPosition = new THREE.Vector3(0.443, 1.103, 0.702);
            const startRotation = new THREE.Quaternion().setFromEuler(this.#camera.rotation);
            const endRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.561, 0, 0.00038));

            const duration = 2000; // in milliseconds
            this.animateCamera(startPosition, endPosition, startRotation, endRotation, duration, this.easeInOutQuad);

            pubSub.publish("beginScene2");
        });
    }

    zoomCameraToLook() {
        // Usage example
        const startPosition = this.#camera.position;
        const endPosition = new THREE.Vector3(0.443, 1.103, 0.702);
        const startRotation = new THREE.Quaternion().setFromEuler(this.#camera.rotation);
        const endRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.561, 0, 0.00038));

        const duration = 2000; // in milliseconds
        this.animateCamera(startPosition, endPosition, startRotation, endRotation, duration, this.easeInOutQuad);
    }

    // TODO 나중에 모듈화
    fileUpload() {
        let fileInput = document.getElementById("pdfUpload");
        fileInput.click();

        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                let file = fileInput.files[0];
                this.removeScene();
                pubSub.publish("beginScene3", file);
            }
        });
    }
}
