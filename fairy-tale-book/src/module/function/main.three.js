import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { pubSub } from "./pubsub";
import axios from "axios";
import Intro from "./intro";
import Book from "./book";

export default class Main {
    stage = "";
    constructor() {
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
        this.resize();

        requestAnimationFrame(this.render.bind(this));

        let raycaster = new THREE.Raycaster();
        this._raycaster = raycaster;

        const mouse = new THREE.Vector2();
        // this._SELECTED = SELECTED
        this._mouse = mouse;

        document.addEventListener("mousedown", this.onDocumentMouseDown.bind(this), false);

        // 일단 event listner ...
        let nextPageEl = document.querySelector("#next-page");
        nextPageEl.addEventListener("click", async () => {
            this.fetchGetTitles();
            await this._book.transitToMakeStoryTwo();
            // test 용 지워야 함
            // this._book.createTitlesOnPage([]);
        });

        let nextPage2El = document.querySelector("#next-page2");
        nextPage2El.addEventListener("click", async () => {
            this.fetchGetBook();
            this.beginLoadingMakingStory();
            this._book.removeMakeStoryLayout();
        });

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
        console.log(intersects);
        console.log(this._camera);
        // console.log(images);
        // 가장 가까운 메쉬를 찾습니다.
        if (intersects.length > 0) {
            console.log(this.stage);
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
                    this._book.turnBackCover();
                } else if (clickedMesh.name === "P1front") {
                    // 책장 넘기기기
                    this._book.clickP1Front(images);
                    // this._book.turnBackPage();
                } else if (clickedMesh.name === "P2front") {
                    // 책장 넘기기기2
                    this._book.clickP2Front(images);
                } else if (clickedMesh.name === "P3front") {
                    this._book.clickP3Front(images);
                } else if (clickedMesh.name === "P1back") {
                    // 책 뒤로가기 1
                    this._book.clickP1Back(images);
                } else if (clickedMesh.name === "P2back") {
                    this._book.clickP2Back(images);
                }
            }
        }
    }

    beginScene2() {
        this._intro.removeScene();

        // this.stage = "READ_BOOK";
        // const images = JSON.parse(sessionStorage.getItem("book"));
        // this._book.createBookCover(images);

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
            .post("http://localhost:3000/api/title", {
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

    async fetchGetBook() {
        const title = document.getElementById("titleSelected").innerText;
        await axios
            .post(
                "http://localhost:3000/api/books",
                { title: title },
                {
                    responseType: "arraybuffer",
                }
            )
            .then(async (response) => {
                // const pdfBlob = new Blob([response.data], { type: "application/pdf" });

                const arrayBuffer = response.data;
                this.prepareBook(arrayBuffer, true);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }

    async prepareBook(arrayBuffer, download) {
        console.log(arrayBuffer);
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

        // sessionStorage.setItem("pdfUrl", JSON.stringify(pdfUrl));

        const images = await this.convertPdfToImages(pdfUrl);

        // sessionStorage.setItem("book", JSON.stringify(images));
        this._images = images;
        this.endLoadingMakingBook();
        // stage 변경
        this.stage = "READ_BOOK";
        // 종료
        this._book.createBookCover(images);
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
        }

        return images;
    }

    removeAura() {
        this._bookObj.remove(this._auraSprite);
    }

    changeTobookLookStage() {
        let makingStoryEl = document.querySelector("#making_story_title");
        makingStoryEl.style.display = "block";

        let makingStoryTextEl = document.querySelector("#making_story_title_text");
        makingStoryTextEl.textContent = "이야기가 완성 되었어요! 클릭하시면 이야기를 읽을수 있어요!";
        makingStoryTextEl.className = "";

        // this._camera.position.set(0.58, 4.93, 1.28);
        // this._camera.rotation.set(-0.017, -0.008, 0);
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

        const book = new Book(this._scene, this._camera, this._cssRenderer, this._gltfLoader, this._renderer);
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
        // console.log(document.body.clientWidth);
        this._cssRenderer?.setSize(width, height);
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
