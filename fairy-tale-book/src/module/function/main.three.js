import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { pubSub } from "./pubsub";
import axios from "axios";
import Intro from "./intro";
import Book from "./book";
// import * as pdfjsLib from "pdfjs-dist";
export default class Main {
    constructor() {
        const scene = new THREE.Scene();
        this._scene = scene;
        const gltfLoader = new GLTFLoader();
        this._gltfLoader = gltfLoader;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer = renderer;

        const myDiv = document.getElementById("three");
        this._myDIv = myDiv;
        this._myDIv.appendChild(this._renderer.domElement);

        this._initModel();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._setupCamera(camera);
        this._setupControls();

        const cssRenderer = new CSS3DRenderer({ antialias: true });
        this._cssRenderer = cssRenderer;
        this._cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this._cssRenderer.domElement.style.position = "absolute";
        this._cssRenderer.domElement.style.top = "0px";
        this._cssRenderer.domElement.style.pointerEvents = "none";

        document.body.appendChild(this._cssRenderer.domElement);

        // resize
        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));

        let raycaster = new THREE.Raycaster();
        this._raycaster = raycaster;

        const mouse = new THREE.Vector2();
        // this._SELECTED = SELECTED
        this._mouse = mouse;

        document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);

        pubSub.subscribe("beginScene2", this.beginScene2.bind(this));
        // document.addEventListener('mousemove', onDocumentMouseMove.bind(this), false);
        // document.addEventListener('mouseup', onDocumentMouseUp, false);

        // 사물 회전
        // function onDocumentMouseMove(event) {
        // event.preventDefault();
        // if (isDragging) {
        // 	mouse.set(event.clientX, event.clientY);
        // 	var delta = new THREE.Vector2().subVectors(mouse, lastMouse);
        // 	var angle = delta.length() * 0.01;
        // 	var axis = new THREE.Vector3(delta.y, delta.x, 0).normalize();
        // 	var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        // 	book.quaternion.premultiply(quaternion);
        // 	book.rotation.setFromQuaternion(book.quaternion, book.rotation.order);
        // 	lastMouse.copy(mouse);
        // }
        // }

        // 카메라 회전
        // function onDocumentMouseMove(event) {
        //     event.preventDefault();
        //     if (isDragging) {
        //         mouse.set(event.clientX, event.clientY);
        //         var delta = new THREE.Vector2().subVectors(mouse, lastMouse);
        //         // var angle = delta.length() * 0.01;
        //         camera.position.x += delta.x * 0.1;
        //         camera.rotation.y -= delta.x * 0.01; // 카메라 시선 방향 변경
        //         camera.lookAt(scene.position);
        //         lastMouse.copy(mouse);
        //     }
        // }
    }

    onDocumentMouseDown(event) {
        // 마우스 클릭 위치를 정규화(normalized)된 장치 좌표(device coordinates)로 변환합니다.
        this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this._camera);

        // 레이캐스팅 결과를 저장할 배열입니다.
        var intersects = this._raycaster.intersectObjects(this._scene.children);
        console.log(intersects);
        // 가장 가까운 메쉬를 찾습니다.
        if (intersects.length > 0) {
            var clickedMesh = intersects[0].object;
            // 특정 메쉬를 클릭한 경우, 이벤트를 발생시킵니다.
            if (clickedMesh.name === "Cube004") {
                // 표지 넘기기
                this._book.turnCover();
            } else if (clickedMesh.name === "P1front") {
                // 책장 넘기기기
                this._book.turnPageFirst(clickedMesh);
            } else if (clickedMesh.name === "P2front") {
                // 책장 넘기기기2
                // this._book.tunPageSecond();
                this.fetchData(clickedMesh);
                // const images = sessionStorage.getItem("book");
                // this._book.createImg(clickedMesh, images);
            } else if (clickedMesh.name === "P1back") {
                // 책 뒤로가기 1
                const newTexture = new THREE.TextureLoader().load("intro.png");
                clickedMesh.material.map = newTexture;
                clickedMesh.material.needsUpdate = true;

                // const mixer = new THREE.AnimationMixer(  this._book );
                // const action = mixer.clipAction( this._animations[ 3 ] );
                // action.setLoop(THREE.LoopOnce)
                // action.clampWhenFinished = true;
                // action.enabled = true;
                // action.play();

                // let animate = () => {
                //     requestAnimationFrame( animate );
                //     mixer.update( 0.01 );
                // }
                // animate();
            }
            // } else if(clickedMesh.name === 'P2back') { // 책 뒤로가기 2 .. 뒤로가기 무한 반복 마지막이 아닐 경우 텍스쳐 입혀 원복

            // }
        }
    }

    beginScene2() {
        this._intro.removeScene();
        this._book.turnCover();
        this._book.turnPageFirst();
        // this._book.tunPageSecond();
        this._book.createMakeStoryLayoutOne();
    }

    async fetchData(clickedMesh) {
        const pageR = document.getElementById("pageR");
        console.log(pageR);
        await axios
            .get("http://localhost:3000/api/books", {
                responseType: "arraybuffer",
            })
            .then(async (response) => {
                // const pdfBlob = new Blob([response.data], { type: "application/pdf" });
                const arrayBuffer = response.data;

                // // Create a Blob from the ArrayBuffer
                const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });

                // // Generate a Blob URL
                const pdfUrl = URL.createObjectURL(pdfBlob);

                console.log(pdfUrl);
                // // Create an anchor element and set its download attribute
                // const link = document.createElement("a");
                // link.href = pdfUrl;
                // link.download = "downloaded_pdf.pdf";

                // // Append the link to the DOM, click it, and remove it
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);

                // // Revoke the Blob URL
                // URL.revokeObjectURL(pdfUrl);

                sessionStorage.setItem("arrayBuffer", arrayBuffer);
                sessionStorage.setItem("pdfUrl", pdfUrl);
                const images = await this.convertPdfToImages(pdfUrl);
                console.log(images);
                sessionStorage.setItem("book", images);

                this._book.createImg(clickedMesh, images[1]);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    async convertPdfToImages(arrayBuffer) {
        // console.log(arrayBuffer);
        // console.log(typeof arrayBuffer);
        const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
        const _pdfjs = await import("pdfjs-dist/build/pdf");
        _pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        const pdf = await _pdfjs.getDocument(
            arrayBuffer // Try to export JPEG images directly if they don't need any further processing.
        ).promise;
        console.log(pdf);
        const numPages = pdf.numPages;
        const images = [];
        console.log(pdf);
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 1.0;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/jpeg");
            images.push(dataUrl);
        }

        return images;
    }

    _setupCamera(camera) {
        camera.position.set(0, 0, 5);

        // camera.position.set(0.45, 1.37, 0.578)
        // camera.rotation.set(-1.53, 0.001037, 0.0264)

        // book camera
        // camera.position.x = 0.45
        // camera.position.y = 1.37
        // camera.position.z = 0.578

        // camera.rotation.x = -1.53
        // camera.rotation.y = 0.001037
        // camera.rotation.z = 0.0264
        // book camera

        camera.rotation.isEuler = true;

        // camera.lookAt(0,0,20)
        camera.updateProjectionMatrix();
        this._camera = camera;
    }
    _setupLight() {
        const light = new THREE.PointLight(0xffe699);
        light.intensity = 1;
        light.distance = 15;
        light.decay = 1;
        light.position.set(1, 4, 0);
        this._light = light;
        this._scene.add(this._light);

        const helper = new THREE.PointLightHelper(light);
        this._scene.add(helper);

        // 임시
        const AmbientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
        this._AmbientLight = AmbientLight;

        this._scene.add(this._AmbientLight);
    }

    _setupControls() {
        // orbit controls
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
        // controls.minDistance = 2;
        // controls.maxDistance = 30;
        // controls.maxPolarAngle = Math.PI / 2.5;
        controls.update();
    }

    async _initModel() {
        const obj = new THREE.Object3D();

        const book = new Book(this._scene, this._camera, this._cssRenderer, this._gltfLoader);
        this._book = book;
        const bookObj = await book.loadBook();
        this._bookObj = bookObj;
        // obj.add(book);

        const house = await this._loadHouse();
        this._house = house;
        obj.add(house);

        this._scene.add(obj);
        this._setupLight();

        const intro = new Intro(this._scene, this._camera, this._renderer, this._cssRenderer);
        this._intro = intro;
        // this.createIntro()
        // this.createIntroPointCss()
    }

    async _loadHouse() {
        return new Promise((resolve) => {
            this._gltfLoader.load(
                "workshop.glb",
                (gltf) => {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene;
                    const bookshelf = model.children[0].children[0].children[0].children[1];
                    const desk = model.children[0].children[0].children[0].children[2];
                    this._bookshelf = bookshelf;
                    this._desk = desk;

                    // const scaleFactor = 0.1;
                    // model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    model.position.set(0.2, 0, 0);
                    // model.rotation.y += Math.PI;
                    resolve(model);

                    // Optional: Set the model's scale
                },
                // called whrenderile loading is progressing
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

    resize() {
        // this._camera.position.set(0.443, 1.103, 0.702)
        // this._camera.rotation.set(-1.561, 0, 0.00038)

        const width = this._myDIv.clientWidth;
        const height = window.innerHeight; // this._myDIv.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
        this._cssRenderer?.setSize(width, height);
        this._css2DRenderer?.setSize(width, height);
    }

    // Function to create a flashing light effect
    flashLight(minIntensity, maxIntensity, duration, pauseDuration) {
        const pointLight = new THREE.PointLight(0xffffff, 0, 100);
        pointLight.position.set(0.45, 1.5, 0.578);
        pointLight.scale.set(0.5, 0.5, 0.5);
        this._scene.add(pointLight);

        const startTime = performance.now();
        const initialIntensity = pointLight.intensity;

        const helper = new THREE.PointLightHelper(pointLight);
        this._scene.add(helper);

        const update = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const intensityDelta = maxIntensity - minIntensity;
                pointLight.intensity = minIntensity + intensityDelta * Math.sin(progress * Math.PI);
                requestAnimationFrame(update);
            } else {
                pointLight.intensity = initialIntensity;
                setTimeout(() => {
                    this.flashLight(minIntensity, maxIntensity, duration, pauseDuration);
                }, pauseDuration);
            }
        };

        update();
    }

    render() {
        this._renderer.render(this._scene, this._camera);

        requestAnimationFrame(this.render.bind(this));
    }
}
