import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export default class ThreeTest {
    constructor() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.set(0, 0, 20);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        const bookWidth = 8;
        const bookHeight = 17;
        const bookDepth = 1;
        const geometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
        const texture = new THREE.TextureLoader().load('./book-cover-image.jpg');
        const material = new THREE.MeshBasicMaterial({ map: texture });

        const book = new THREE.Mesh(geometry, material);
        scene.add( book );

        // renderer.render( scene, camera );

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        animate();

        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

        var mouse = new THREE.Vector2();
        var lastMouse = new THREE.Vector2();
        var isDragging = false;

        function onDocumentMouseDown(event) {
            event.preventDefault();
            isDragging = true;
            lastMouse.set(event.clientX, event.clientY);
        }	

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
        function onDocumentMouseMove(event) {
            event.preventDefault();
            if (isDragging) {
                mouse.set(event.clientX, event.clientY);
                var delta = new THREE.Vector2().subVectors(mouse, lastMouse);
                // var angle = delta.length() * 0.01;
                camera.position.x += delta.x * 0.1;
                camera.rotation.y -= delta.x * 0.01; // 카메라 시선 방향 변경
                camera.lookAt(scene.position);
                lastMouse.copy(mouse);
            }
        }

        function onDocumentMouseUp(event) {
        event.preventDefault();
        isDragging = false;
        }

        // 사물 자동 회전
        // function animate() {
        // 	requestAnimationFrame( animate );
        // 	cube.rotation.x += 0.01;
        // 	cube.rotation.y += 0.01;
        // 	renderer.render( scene, camera );
        // }
        // animate();


        // MTLLoader와 OBJLoader2를 로드합니다.
        const loader = new OBJLoader();

        // MTLLoader로 .mtl 파일을 로드하고, OBJLoader2로 .obj 파일을 로드합니다.
        loader.load('light_oak_bookshelf/light_oak_bookshelf.obj', 
            function (materials) {
                scene.add(materials);
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened', error );
            }
        );

        function animate2() {
            requestAnimationFrame(animate2);

            // 모델 회전 애니메이션 등을 적용합니다.
            // ...

            renderer.render(scene, camera);
        }

        animate2();
    }
}