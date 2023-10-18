import * as THREE from "three";
import store from "@/store/store";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { pubSub } from "./utils/pubsub";
import {fetchGetTitles} from "./api/api"
import Intro from "./scene/intro";
import Book from "./elements/book";
import Space from "./elements/space";
import Particle from "./elements/particle";

export default class Main {
    // private define
    #controls;
    #scene;
    #gltfLoader;
    #renderer;
    #myDIv;
    #cssRenderer;
    #raycaster;
    #mouse;
    #camera;
    #images;
    #book;
    #intro;
    #bookObj;
    #auraSprite;
    #light;
    #particle;
    #AmbientLight;
    stage = "";
    loadedPercent = 0;
    minDistance = 1.6;
    maxDistance = 7;
    maxAzimuthAngle = Math.PI / 4;
    minAzimuthAngle = -Math.PI / 4;
    maxPolarAngle = Math.PI / 3;

    init() {
        this.stage = "INTRO";
        const scene = new THREE.Scene();
        this.#scene = scene;
        const gltfLoader = new GLTFLoader();
        this.#gltfLoader = gltfLoader;

        // render 설정
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);

        this.#renderer = renderer;

        const myDiv = document.getElementById("three");
        this.#myDIv = myDiv;
        this.#myDIv.appendChild(this.#renderer.domElement);

        this.#initModel();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.#setupCamera(camera);
        this.#setupControls();

        const cssRenderer = new CSS3DRenderer({ antialias: true });
        this.#cssRenderer = cssRenderer;
        this.#cssRenderer.setSize(window.innerWidth, window.innerHeight);
        this.#cssRenderer.domElement.style.position = "absolute";
        this.#cssRenderer.domElement.style.top = "0px";
        this.#cssRenderer.domElement.style.pointerEvents = "none";

        document.body.appendChild(this.#cssRenderer.domElement);

        // resize
        window.onresize = this.resize.bind(this);

        requestAnimationFrame(this.render.bind(this));

        let raycaster = new THREE.Raycaster();
        this.#raycaster = raycaster;

        const mouse = new THREE.Vector2();
        this.#mouse = mouse;

        this.#particle = new Particle(this.#scene, this.#renderer, this.#camera);

        myDiv.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);

        pubSub.subscribe("getTitles", this.getTitles.bind(this));
        pubSub.subscribe("makeStory", this.makeStory.bind(this));
        pubSub.subscribe("beginScene2", this.beginScene2.bind(this));
        pubSub.subscribe("beginScene3", this.prepareBook.bind(this));
    }

    onDocumentMouseDown(event) {
        // 마우스 클릭 위치를 정규화(normalized)된 장치 좌표(device coordinates)로 변환합니다.
        this.#mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.#mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.#raycaster.setFromCamera(this.#mouse, this.#camera);

        // 레이캐스팅 결과를 저장할 배열입니다.
        const intersects = this.#raycaster.intersectObjects(this.#scene.children);

        let clickedMesh = null;
        for (let intersect of intersects) {
            clickedMesh = intersect.object;
            if (clickedMesh.name.length > 0) {
                break;
            }
        }

        // 가장 가까운 메쉬를 찾습니다.
        if (intersects.length > 0) {
            // 특정 메쉬를 클릭한 경우, 이벤트를 발생시킵니다.
            if (this.stage === "READ_BOOK") {
                // const images = JSON.parse(sessionStorage.getItem("book"));
                const images = this.#images;
                localStorage.getItem("book", JSON.stringify(images));

                if (clickedMesh.name === "coverL") {
                    // 표지 넘기기
                    this.#book.clickCoverFront(images);
                } else if (clickedMesh.name === "coverL_1") {
                    this.#book.clickCoverBack();
                } else if (clickedMesh.name === "Page1Front") {
                    // 책장 넘기기기
                    this.#book.clickP1Front(images);
                    // this.#book.turnBackPage();
                } else if (clickedMesh.name === "Page2Front") {
                    // 책장 넘기기기2
                    this.#book.clickP2Front(images);
                } else if (clickedMesh.name === "Pages") {
                    this.#book.clickP3Front(images);
                } else if (clickedMesh.name === "Page1Back") {
                    // 책 뒤로가기 1
                    this.#book.clickP1Back(images);
                } else if (clickedMesh.name === "Page2Back") {
                    this.#book.clickP2Back(images);
                }
            }
        }
    }

    async goHome() {
        this.#intro.addScene();
        this.#unlimitControl();
        this.#setupCamera(this.#camera);

        this.#book.removeMakeStoryLayout();

        let selectedObject = this.#scene.getObjectByName("book");
        this.#scene.remove(selectedObject);

        const book = new Book(this.#scene, this.#camera, this.#cssRenderer, this.#gltfLoader, this.#renderer);
        this.#book = book;
        const bookObj = await book.loadBook();
        this.#bookObj = bookObj;
    }

    beginScene2() {
        this.#intro.removeScene();
        this.#limitControls();

        this.#book.turnCover();
        this.#book.turnPageFirst();
        this.#book.createMakeStoryLayoutOne();
    }

    async beginLoadingMakingStory() {
        // 책 덮기
        this.#book.turnBackPageFirst();
        this.#book.turnBackPageSecond();
        this.#book.turnBackCover();
        // 아우라 추가
        // this.addAura();

        // 카메라 이동
        const startPosition = this.#camera.position;
        const endPosition = new THREE.Vector3(0.443, 3, 0.702);
        const duration = 2000;
        this.animateCamera(startPosition, endPosition, duration, this.easeInOutQuad);
        // text 추가
        let makingStoryEl = document.querySelector("#making_story_title");
        makingStoryEl.style.display = "flex";
    }

    async endLoadingMakingBook() {
        // 아우라 제거
        // this.removeAura();

        // text 변경
        let makingStoryEl = document.querySelector("#making_story_title");
        makingStoryEl.style.display = "none";

        // 새로운 book 띄우기
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    animateCamera(startPosition, endPosition, duration, easing) {
        const startTime = performance.now();
        const start = startPosition.clone();
        const end = endPosition.clone();
        const diffPosition = end.clone().sub(start);

        const move = (timestamp) => {
            const elapsedTime = timestamp - startTime;
            const progress = elapsedTime / duration;

            if (progress < 1) {
                const easedProgress = easing(progress);
                const currentPosition = start.clone().add(diffPosition.clone().multiplyScalar(easedProgress));
                this.#camera.position.copy(currentPosition);
                this.#renderer.render(this.#scene, this.#camera);
                requestAnimationFrame(move);
            } else {
                this.#camera.position.copy(end);
                this.#renderer.render(this.#scene, this.#camera);
            }
        };

        requestAnimationFrame(move);
    }

    async fetchGetTitles() {
        const mainCharacter = document.querySelectorAll("#mainCharacter")[1].value;

        const genre = document.querySelectorAll("#genre")[1].value;

        try {
            const response = await fetchGetTitles({mainCharacter: mainCharacter, genre: genre})
            this.#book.createTitlesOnPage(response.data);
        } catch(error) {
            console.error("Error fetching data:", error);
        }
    }

    async fetchGetBook(title) {
        const imgs = ["story.gif", "picture.gif", "pdf.gif"];
        // 1. 웹소켓 클라이언트 객체 생성
        const webSocket = new WebSocket(process.env.VUE_APP_WS_API_URL + "api/v1/books");

        // 2. 웹소켓 이벤트 처리
        // 2-1) 연결 이벤트 처리
        webSocket.onopen = () => {
            webSocket.send(title);
            console.log("웹소켓서버와 연결 성공");
        };
        // 2-2) 메세지 수신 이벤트 처리
        webSocket.onmessage = async function (e) {
            if (typeof e.data === "object") {
                const arrayBuffer = e.data;
                await this.prepareBook(arrayBuffer, true);
                webSocket.close();
            } else {
                let beginStage = JSON.parse(e.data).beginStage;
                let makingStorySubTextEl = document.querySelector("#making_story_title_sub_text");
                let makingStoryImgEl = document.getElementById("making_story_img");
                if (beginStage === 1) {
                    makingStorySubTextEl.textContent = "이야기를 만들고 있어요.";
                    let step1 = document.querySelector("#making_story_title_step1");
                    step1.className = "making_story_title_step current_step";
                    let step2 = document.querySelector("#making_story_title_step2");
                    step2.className = "making_story_title_step";
                    let step3 = document.querySelector("#making_story_title_step3");
                    step3.className = "making_story_title_step";
                    makingStoryImgEl.src = imgs[0];
                } else if (beginStage === 2) {
                    makingStorySubTextEl.textContent = "그림을 만들고 있어요.";
                    let step2 = document.querySelector("#making_story_title_step2");
                    step2.className += " current_step";
                    makingStoryImgEl.src = imgs[1];
                } else if (beginStage === 3) {
                    makingStorySubTextEl.textContent = "Pdf 파일을 만들고 있어요.";
                    let step3 = document.querySelector("#making_story_title_step3");
                    step3.className += " current_step";
                    makingStoryImgEl.src = imgs[2];
                }
            }
        }.bind(this);

        // 2-3) 연결 종료 이벤트 처리
        webSocket.onclose = function () {
            console.log("서버 웹소켓 연결 종료");
        };

        // 2-4) 에러 발생 이벤트 처리
        webSocket.onerror = function (event) {
            console.log(event);
        };
    }

    async prepareBook(arrayBuffer, download) {
        // Create a Blob from the ArrayBuffer
        const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });

        // Generate a Blob URL
        const pdfUrl = URL.createObjectURL(pdfBlob);

        if (download) {
            // Open the URL on new Window
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.setAttribute("download", "book.pdf"); // or any other extension
            document.body.appendChild(link);
            link.click();
        }
        const images = await this.convertPdfToImages(pdfUrl);

        this.#images = images;

        this.#limitControls();
        this.endLoadingMakingBook();
        this.#intro.zoomCameraToLook();

        // stage 변경
        this.stage = "READ_BOOK";
        // 종료
        this.#book.createBookCover(images);
    }

    extractedTexts = [];
    async convertPdfToImages(arrayBuffer) {
        const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
        const pdfjs = await import("pdfjs-dist/build/pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        const pdf = await pdfjs.getDocument(
            arrayBuffer // Try to export JPEG images directly if they don't need any further processing.
        ).promise;
        const numPages = pdf.numPages;
        const images = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 3.0;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/jpeg");
            images.push(dataUrl);

            // text 추출
            let extractedText = "";
            const textContent = await page.getTextContent();
            // Concatenate the extracted text
            textContent.items.forEach((item) => {
                extractedText += item.str + " ";
            });
            this.extractedTexts.push(extractedText);
        }

        console.log(this.extractedTexts);
        this.#book.extractedTexts = this.extractedTexts;
        return images;
    }

    async getTitles() {
        this.fetchGetTitles();
        await this.#book.transitToMakeStoryTwo();
    }

    async makeStory() {
        const title = document.querySelectorAll("#titleSelected")[1].innerText;
        if (title) {
            this.fetchGetBook(title);
            this.beginLoadingMakingStory();
            this.#book.removeMakeStoryLayout();
        }
    }

    removeAura() {
        this.#bookObj.remove(this.#auraSprite);
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

    addAura() {
        const auraTexture = this.createAuraTexture();
        const auraMaterial = new THREE.SpriteMaterial({
            map: auraTexture,
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });

        const auraSprite = new THREE.Sprite(auraMaterial);
        this.#auraSprite = auraSprite;
        auraSprite.scale.set(5, 5, 5); // 원하는 크기로 조절

        this.#bookObj.add(auraSprite); // 메쉬에 스프라이트를 자식으로 추가
        auraSprite.position.set(-1, 0, 0); // 원하는 위치에 스프라이트를 놓으세요.

        const animate = (time) => {
            requestAnimationFrame(animate);

            const delta = (Math.sin(time * 0.001) + 1) / 2;
            auraMaterial.opacity = delta * 2;

            this.#renderer.render(this.#scene, this.#camera);
        };

        animate(2000);
    }

    #setupCamera(camera) {
        camera.position.set(2.06, 2.55, 5.98);
        camera.rotation.set(-0.404, 0.307, 0.128);

        camera.rotation.isEuler = true;

        camera.updateProjectionMatrix();
        this.#camera = camera;
    }
    #setupLight() {
        const light = new THREE.PointLight(0xffe699);
        light.intensity = 1;
        light.distance = 15;
        light.decay = 1;
        light.position.set(1, 4, 0);
        this.#light = light;
        this.#scene.add(this.#light);

        // 임시
        const AmbientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
        this.#AmbientLight = AmbientLight;
        this.#scene.add(this.#AmbientLight);
    }

    #setupControls() {
        // orbit controls
        this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
        // Set the constraints
        this.#controls.maxPolarAngle = this.maxPolarAngle; // Minimum polar angle (45 degrees)
        this.#controls.minDistance = this.minDistance;
        this.#controls.maxDistance = this.maxDistance;
        this.#controls.minAzimuthAngle = this.minAzimuthAngle; // Minimum horizontal rotation (left)
        this.#controls.maxAzimuthAngle = this.maxAzimuthAngle;
        this.#controls.update();
    }

    // control 기능을 제한 한다.
    #limitControls() {
        this.#controls.enabled = false;
    }

    // control 기능을 제한을 해제 한다.
    #unlimitControl() {
        this.#controls.enabled = true;
    }

    async #initModel() {
        const obj = new THREE.Object3D();

        const book = new Book(this.#scene, this.#camera, this.#cssRenderer, this.#gltfLoader, this.#renderer);
        this.#book = book;
        const bookObj = await book.loadBook();
        this.#bookObj = bookObj;

        const space = new Space(this.#gltfLoader);
        const spaceObj = await space.loadSpace();
        obj.add(spaceObj);

        this.#scene.add(obj);
        this.#setupLight();

        const intro = new Intro(this.#scene, this.#camera, this.#renderer, this.#cssRenderer);
        this.#intro = intro;
        store.dispatch("setInitCompleted", true);
    }

    resize() {
        const width = this.#myDIv.clientWidth;
        const height = window.innerHeight;

        this.#camera.aspect = width / height;
        this.#camera.updateProjectionMatrix();

        this.#renderer.setSize(width, height);
        this.#cssRenderer?.setSize(width, height);
    }

    render() {
        this.#renderer.render(this.#scene, this.#camera);

        requestAnimationFrame(this.render.bind(this));
    }
}
