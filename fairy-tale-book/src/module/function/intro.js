import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { pubSub } from "./pubsub";

export default class Intro {
    constructor(scene, camera, renderer, cssRenderer) {
        this._scene = scene;
        this._camera = camera;
        this._renderer = renderer;
        this._cssRenderer = cssRenderer;
        this.init();
    }

    init() {
        const load = document.getElementById("load");
        const loadOverlay = new CSS3DObject(load);
        this._loadOverlay = loadOverlay;
        loadOverlay.position.set(-0.2, 1, 3);
        loadOverlay.rotation.set(0, Math.PI / 4, 0);
        loadOverlay.scale.set(0.004, 0.004, 0.006);

        const loadPonter = document.getElementById("arrow-load");
        const loadPonterOverlay = new CSS3DObject(loadPonter);
        this._loadPonterOverlay = loadPonterOverlay;
        loadPonterOverlay.position.set(-0.5, 1.9, 3.4);
        loadPonterOverlay.rotation.set(-Math.PI / 3, Math.PI / 3, 0);
        loadPonterOverlay.scale.set(0.01, 0.01, 0.01);

        const start = document.getElementById("start");
        const startOverlay = new CSS3DObject(start);
        this._startOverlay = startOverlay;
        startOverlay.position.set(0.45, 0.8, 0.7);
        startOverlay.scale.set(0.004, 0.004, 0.006);

        startOverlay.lookAt(this._camera.position);

        const startPonter = document.getElementById("arrow-start");
        const startPonterOverlay = new CSS3DObject(startPonter);
        this._startPonterOverlay = startPonterOverlay;
        startPonterOverlay.position.set(0.45, 1.1, 0.7);
        startPonterOverlay.rotation.set(0, 0, -Math.PI / 2);
        startPonterOverlay.scale.set(0.008, 0.008, 0.008);

        this._cssRenderer.render(this._scene, this._camera);
        // _div.position.set(0.594, 0.6, 0.714)

        const deskFrameFront = document.getElementById("desk_frame_front");
        this._deskFrameFront = deskFrameFront;
        const deskFrameOverlay = new CSS3DObject(deskFrameFront);
        this._deskFrameOverlay = deskFrameOverlay;
        deskFrameOverlay.position.set(0.35, 0.45, 1);
        deskFrameOverlay.scale.set(0.13, 0.07, 0.1);

        const deskFrameTop = document.getElementById("desk_frame_top");
        this._deskFrameTop = deskFrameTop;
        const deskFrameTopOverlay = new CSS3DObject(deskFrameTop);
        this._deskFrameTopOverlay = deskFrameTopOverlay;
        deskFrameTopOverlay.position.set(0.35, 0.6, 0.7);
        deskFrameTopOverlay.rotation.set(Math.PI / 2, 0, 0);
        deskFrameTopOverlay.scale.set(0.13, 0.06, 0.1);

        const bookshelfFrameFront = document.getElementById("bookshelf_frame_front");
        this._bookshelfFrameFront = bookshelfFrameFront;
        const bookshelfFrameFrontOverlay = new CSS3DObject(bookshelfFrameFront);
        this._bookshelfFrameFrontOverlay = bookshelfFrameFrontOverlay;
        bookshelfFrameFrontOverlay.position.set(-0.18, 1, 3);
        bookshelfFrameFrontOverlay.rotation.set(0, Math.PI / 4, 0);
        bookshelfFrameFrontOverlay.scale.set(0.05, 0.15, 0.1);

        const bookshelfFrameSide = document.getElementById("bookshelf_frame_side");
        this._bookshelfFrameSide = bookshelfFrameSide;
        const bookshelfFrameSideOverlay = new CSS3DObject(bookshelfFrameSide);
        this._bookshelfFrameSideOverlay = bookshelfFrameSideOverlay;
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
            this._cssRenderer.render(this._scene, this._camera);
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
                this._camera.position.copy(currentPosition);
                this._camera.setRotationFromQuaternion(quaternion);
                this._renderer.render(this._scene, this._camera);
                requestAnimationFrame(move);
            } else {
                this._camera.position.copy(end);
                this._camera.setRotationFromQuaternion(endQuaternion);
                this._renderer.render(this._scene, this._camera);
            }
        };

        requestAnimationFrame(move);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    addScene() {
        this._scene.add(this._loadOverlay);
        this._scene.add(this._loadPonterOverlay);
        this._scene.add(this._bookshelfFrameFrontOverlay);
        this._scene.add(this._bookshelfFrameSideOverlay);
        this._scene.add(this._startOverlay);
        this._scene.add(this._startPonterOverlay);
        this._scene.add(this._deskFrameOverlay);
        this._scene.add(this._deskFrameTopOverlay);
    }

    removeScene() {
        console.log("remove!");
        this._scene.remove(this._loadOverlay);
        this._scene.remove(this._loadPonterOverlay);
        this._scene.remove(this._bookshelfFrameFrontOverlay);
        this._scene.remove(this._bookshelfFrameSideOverlay);
        this._scene.remove(this._startOverlay);
        this._scene.remove(this._startPonterOverlay);
        this._scene.remove(this._deskFrameOverlay);
        this._scene.remove(this._deskFrameTopOverlay);
    }

    setHoveringListener() {
        this._bookshelfFrameFront.addEventListener("mouseenter", () => {
            let el = this._loadOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this._bookshelfFrameFront.addEventListener("mouseleave", () => {
            let el = this._loadOverlay.element.querySelector("#circle");
            el.className = "";
        });

        this._bookshelfFrameSide.addEventListener("mouseenter", () => {
            let el = this._loadOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this._bookshelfFrameSide.addEventListener("mouseleave", () => {
            let el = this._loadOverlay.element.querySelector("#circle");
            el.className = "";
        });

        this._deskFrameFront.addEventListener("mouseenter", () => {
            let el = this._startOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this._deskFrameFront.addEventListener("mouseleave", () => {
            let el = this._startOverlay.element.querySelector("#circle");
            el.className = "";
        });
        this._deskFrameTop.addEventListener("mouseenter", () => {
            let el = this._startOverlay.element.querySelector("#circle");
            el.className = "circle";
        });

        this._deskFrameTop.addEventListener("mouseleave", () => {
            let el = this._startOverlay.element.querySelector("#circle");
            el.className = "";
        });

        // 이야기 만들기
        this._deskFrameFront.addEventListener("click", () => {
            // Usage example
            const startPosition = this._camera.position;
            const endPosition = new THREE.Vector3(0.443, 1.103, 0.702);
            const startRotation = new THREE.Quaternion().setFromEuler(this._camera.rotation);
            const endRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.561, 0, 0.00038));

            // const endRotation = new THREE.Quaternion(-1.561, 0, 0.00038)

            const duration = 2000; // in milliseconds
            this.animateCamera(startPosition, endPosition, startRotation, endRotation, duration, this.easeInOutQuad);

            pubSub.publish("beginScene2");
        });

        this._deskFrameTop.addEventListener("click", () => {
            // Usage example
            const startPosition = this._camera.position;
            const endPosition = new THREE.Vector3(0.443, 1.103, 0.702);
            const startRotation = new THREE.Quaternion().setFromEuler(this._camera.rotation);
            const endRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.561, 0, 0.00038));

            // const endRotation = new THREE.Quaternion(-1.561, 0, 0.00038)

            const duration = 2000; // in milliseconds
            this.animateCamera(startPosition, endPosition, startRotation, endRotation, duration, this.easeInOutQuad);

            pubSub.publish("beginScene2");
        });
    }
}
