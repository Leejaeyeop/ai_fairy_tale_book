import * as THREE from "three";
import store from "@/store/store";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { pubSub } from "./utils/pubsub";
import axios from "axios";
import Intro from "./scene/intro";
import Book from "./elements/book";
import Space from "./elements/space";

export default class Main {
    // private define
    #controls;
    stage = "";
    loadedPercent = 0;
    minDistance = 2;
    maxDistance = 10;
    maxAzimuthAngle = Math.PI / 4;
    minAzimuthAngle = -Math.PI / 4;
    maxPolarAngle = Math.PI / 3;

    init() {
        this.stage = "INTRO";
        const scene = new THREE.Scene();
        this._scene = scene;
        const gltfLoader = new GLTFLoader();
        this._gltfLoader = gltfLoader;

        // render 설정
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor("skyblue");
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
        // this.resize();

        requestAnimationFrame(this.render.bind(this));

        let raycaster = new THREE.Raycaster();
        this._raycaster = raycaster;

        const mouse = new THREE.Vector2();
        // this._SELECTED = SELECTED
        this._mouse = mouse;

        myDiv.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);

        pubSub.subscribe("getTitles", this.getTitles.bind(this));
        pubSub.subscribe("makeStory", this.makeStory.bind(this));
        pubSub.subscribe("beginScene2", this.beginScene2.bind(this));
        pubSub.subscribe("beginScene3", this.prepareBook.bind(this));
    }

    onDocumentMouseDown(event) {
        // 마우스 클릭 위치를 정규화(normalized)된 장치 좌표(device coordinates)로 변환합니다.
        this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this._camera);

        // 레이캐스팅 결과를 저장할 배열입니다.
        var intersects = this._raycaster.intersectObjects(this._scene.children);
        // 가장 가까운 메쉬를 찾습니다.
        if (intersects.length > 0) {
            var clickedMesh = intersects[0].object;
            console.log(clickedMesh);
            // 특정 메쉬를 클릭한 경우, 이벤트를 발생시킵니다.
            if (this.stage === "READ_BOOK") {
                // const images = JSON.parse(sessionStorage.getItem("book"));
                const images = this._images;
                localStorage.getItem("book", JSON.stringify(images));

                if (clickedMesh.name === "coverL") {
                    // 표지 넘기기
                    this._book.clickCoverFront(images);
                } else if (clickedMesh.name === "coverL_1") {
                    this._book.clickCoverBack();
                } else if (clickedMesh.name === "Page1Front") {
                    // 책장 넘기기기
                    this._book.clickP1Front(images);
                    // this._book.turnBackPage();
                } else if (clickedMesh.name === "Page2Front") {
                    // 책장 넘기기기2
                    this._book.clickP2Front(images);
                } else if (clickedMesh.name === "Pages") {
                    this._book.clickP3Front(images);
                } else if (clickedMesh.name === "Page1Back") {
                    // 책 뒤로가기 1
                    this._book.clickP1Back(images);
                } else if (clickedMesh.name === "Page2Back") {
                    this._book.clickP2Back(images);
                }
            }
        }
    }

    async goHome() {
        this._intro.addScene();
        this.#unlimitControl();
        this._setupCamera(this._camera);

        this._book.removeMakeStoryLayout();

        let selectedObject = this._scene.getObjectByName("book");
        this._scene.remove(selectedObject);

        const bookObj = await this._book.loadBook();
        this._bookObj = bookObj;
    }

    beginScene2() {
        this._intro.removeScene();
        this.#limitControls();

        this._book.turnCover();
        this._book.turnPageFirst();
        this._book.createMakeStoryLayoutOne();
    }

    async beginLoadingMakingStory() {
        // 책 덮기
        this._book.turnBackPageFirst();
        this._book.turnBackPageSecond();
        this._book.turnBackCover();
        // 아우라 추가
        this.addAura();

        // 카메라 이동
        const startPosition = this._camera.position;
        const endPosition = new THREE.Vector3(0.443, 3, 0.702);
        const duration = 2000;
        this.animateCamera(startPosition, endPosition, duration, this.easeInOutQuad);
        // text 추가
        let makingStoryEl = document.querySelector("#making_story_title");
        makingStoryEl.style.display = "block";

        let makingStoryTextEl = document.querySelector("#making_story_title_text");
        makingStoryTextEl.textContent = "이야기를 만들고 있어요. 잠시만 기다려 주세요! . . .";
        makingStoryTextEl.className = "dot";
    }

    async endLoadingMakingBook() {
        // 아우라 제거
        this.removeAura();

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
                this._camera.position.copy(currentPosition);
                this._renderer.render(this._scene, this._camera);
                requestAnimationFrame(move);
            } else {
                this._camera.position.copy(end);
                this._renderer.render(this._scene, this._camera);
            }
        };

        requestAnimationFrame(move);
    }

    async fetchGetTitles() {
        console.log(document.getElementById("mainCharacter"));
        console.log(document.getElementById("genre"));
        const mainCharacter = document.getElementById("mainCharacter").value;
        const genre = document.getElementById("genre").value;
        // const pageCount = document.getElementById("pageCount")?.value;
        const data = {
            mainCharacter: mainCharacter,
            genre: genre,
            // pageCount: pageCount,
        };

        await axios
            .post(process.env.VUE_APP_API_URL + "api/title", {
                data: data,
                responseType: "json",
            })
            .then(async (response) => {
                console.log(response);
                // 종료
                this._book.createTitlesOnPage(response.data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    async fetchGetBook(title) {
        await axios
            .post(
                process.env.VUE_APP_API_URL + "api/books",
                { title: title },
                {
                    responseType: "arraybuffer",
                }
            )
            .then(async (response) => {
                const arrayBuffer = response.data;
                this.prepareBook(arrayBuffer, true);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    async prepareBook(arrayBuffer, download) {
        // // Create a Blob from the ArrayBuffer
        const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });

        // // Generate a Blob URL
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

        this._images = images;
        this.#unlimitControl();

        this.endLoadingMakingBook();
        this._intro.zoomCameraToLook();
        // stage 변경
        this.stage = "READ_BOOK";
        //
        // 종료
        this._book.createBookCover(images);
    }

    extractedTexts = [];
    async convertPdfToImages(arrayBuffer) {
        const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
        const _pdfjs = await import("pdfjs-dist/build/pdf");
        _pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        const pdf = await _pdfjs.getDocument(
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
        this._book.extractedTexts = this.extractedTexts;
        return images;
    }

    async getTitles() {
        this.fetchGetTitles();
        await this._book.transitToMakeStoryTwo();
    }

    async makeStory() {
        const title = document.querySelectorAll("#titleSelected")[1].innerText;
        if (title) {
            this.fetchGetBook(title);
            this.beginLoadingMakingStory();
            this._book.removeMakeStoryLayout();
        }
    }

    removeAura() {
        this._bookObj.remove(this._auraSprite);
    }

    changeToBookLookStage() {
        let makingStoryEl = document.querySelector("#making_story_title");
        makingStoryEl.style.display = "block";

        let makingStoryTextEl = document.querySelector("#making_story_title_text");
        makingStoryTextEl.textContent = "이야기가 완성 되었어요! 클릭하시면 이야기를 읽을수 있어요!";
        makingStoryTextEl.className = "";
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
        this._auraSprite = auraSprite;
        auraSprite.scale.set(5, 5, 5); // 원하는 크기로 조절

        this._bookObj.add(auraSprite); // 메쉬에 스프라이트를 자식으로 추가
        auraSprite.position.set(-1, 0, 0); // 원하는 위치에 스프라이트를 놓으세요.

        const animate = (time) => {
            requestAnimationFrame(animate);

            const delta = (Math.sin(time * 0.001) + 1) / 2;
            auraMaterial.opacity = delta * 2;

            this._renderer.render(this._scene, this._camera);
        };

        animate(2000);
    }

    _setupCamera(camera) {
        camera.position.set(2.06, 2.55, 5.98);
        camera.rotation.set(-0.404, 0.307, 0.128);

        camera.rotation.isEuler = true;

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

        // const helper = new THREE.PointLightHelper(light);
        // this._scene.add(helper);

        // 임시
        const AmbientLight = new THREE.AmbientLight(0x404040, 1); // soft white light
        this._AmbientLight = AmbientLight;
        this._scene.add(this._AmbientLight);
    }

    _setupControls() {
        // orbit controls
        this.#controls = new OrbitControls(this._camera, this._renderer.domElement);
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

    async _initModel() {
        const obj = new THREE.Object3D();

        const book = new Book(this._scene, this._camera, this._cssRenderer, this._gltfLoader, this._renderer);
        this._book = book;
        const bookObj = await book.loadBook();
        this._bookObj = bookObj;

        const space = new Space(this._gltfLoader);
        this._space = space;
        const spaceObj = await space.loadSpace();
        this._spaceObj = spaceObj;
        obj.add(spaceObj);

        this._scene.add(obj);
        this._setupLight();

        const intro = new Intro(this._scene, this._camera, this._renderer, this._cssRenderer);
        this._intro = intro;
        store.dispatch("setInitCompleted", true);
    }

    resize() {
        const width = this._myDIv.clientWidth;
        const height = window.innerHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(width, height);
        this._cssRenderer?.setSize(width, height);
    }

    render() {
        this._renderer.render(this._scene, this._camera);

        requestAnimationFrame(this.render.bind(this));
    }
}
