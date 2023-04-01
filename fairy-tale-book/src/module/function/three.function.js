import * as THREE from 'three';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class ThreeTest {
    constructor() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.set(0, 0, 20);

        // 조명 설정
        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(1 , 1, 1);
        // scene.add(ambientLight, directionalLight);
        scene.add(directionalLight)

        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        
        const myDiv = document.getElementById("three")
        myDiv.appendChild(renderer.domElement);

        // orbit controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.minDistance = 2;
        controls.maxDistance = 30;
        controls.update()
        // book modeling
        // const bookWidth = 8; 
        // const bookHeight = 17;
        // const bookDepth = 1;
        // const geometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
        // const texture = new THREE.TextureLoader().load('/book-cover-image.jpg');
        // const material = new THREE.MeshBasicMaterial({ map: texture });
        // const book = new THREE.Mesh(geometry, material);
        // scene.add( book );

        // renderer.render( scene, camera );

        function animate() {
            requestAnimationFrame(animate);
            controls.update()
            renderer.render(scene, camera);
        }
        animate();

        // document.addEventListener('mousedown', onDocumentMouseDown, false);
        // document.addEventListener('mousemove', onDocumentMouseMove, false);
        // document.addEventListener('mouseup', onDocumentMouseUp, false);

        // var mouse = new THREE.Vector2();
        // var lastMouse = new THREE.Vector2();
        // var isDragging = false;

        // function onDocumentMouseDown(event) {
        //     event.preventDefault();
        //     isDragging = true;
        //     lastMouse.set(event.clientX, event.clientY);
        // }	

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

        // function onDocumentMouseUp(event) {
        //     event.preventDefault();
        //     isDragging = false;
        // }

        // 사물 자동 회전
        // function animate() {
        // 	requestAnimationFrame( animate );
        // 	cube.rotation.x += 0.01;
        // 	cube.rotation.y += 0.01;
        // 	renderer.render( scene, camera );
        // }
        // animate();



        const loader = new GLTFLoader();

        // 책장 
        loader.load(
            // path to the glTF file
            '/simple_book_shelf/scene.gltf',
            // called when the resource is loaded
            function ( gltf ) {
                // add the loaded glTF model to the scene
                const model = gltf.scene 

                const scaleFactor = 5;
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                //model.normalize()
                
                scene.add( model );

                // Optional: Set the model's initial position and rotation
                model.position.set(10, 0, 0);
                
                model.rotation.y = -Math.PI / 4;
                // Optional: Set the model's scale
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened', error );
            }
        );

        // 책상
        loader.load(
            '/simple_desk/scene.gltf',
            function ( gltf ) {
                // add the loaded glTF model to the scene
                const model = gltf.scene 

                const scaleFactor = 10;
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                //model.normalize()
                
                scene.add( model );

                // Optional: Set the model's initial position and rotation
                model.position.set(0, 0, 0);
                // model.rotation.set(0,5,0)
                // Optional: Set the model's scale
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened', error );
            }
        )
        
        // 바닥을 위한 평면 지오메트리 생성
        const planeGeometry = new THREE.PlaneGeometry(1000, 1000);

        // 바닥에 적용할 머티리얼 생성
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

        // 메쉬 생성
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        // 바닥을 x-z 평면에 놓기 위해 회전
        planeMesh.rotation.x = -Math.PI / 2;

        // 씬에 추가
        scene.add(planeMesh);
    }
}