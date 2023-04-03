import * as THREE from 'three';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


export default class ThreeTest {
    constructor() {
        const scene = new THREE.Scene();
        this._scene = scene
        const loader = new GLTFLoader();
        this._loader = loader 

        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setPixelRatio(window.devicePixelRatio)
        this._renderer = renderer
        
        const myDiv = document.getElementById("three")
        this._myDIv = myDiv
        this._myDIv.appendChild( this._renderer.domElement);

        this._initModel()
        this._setupCamera()
        // this._setupLight()
        this._setupControls()

        // resize
        window.onresize = this.resize.bind(this)
        this.resize()

        requestAnimationFrame(this.render.bind(this))

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

        // function animate() {
        //     requestAnimationFrame(animate);
        //     controls.update()
        //     this._renderer.render(scene, this.camera);
        // }
        // animate();

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

        // 책장 
        // loader.load(
        //     // path to the glTF file
        //     '/simple_book_shelf/scene.gltf',
        //     // called when the resource is loaded
        //     function ( gltf ) {
        //         // add the loaded glTF model to the scene
        //         const model = gltf.scene 

        //         const scaleFactor = 5;
        //         model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        //         //model.normalize()
                
        //         scene.add( model );

        //         // Optional: Set the model's initial position and rotation
        //         model.position.set(10, 0, 0);
                
        //         model.rotation.y = -Math.PI / 4;
        //         // Optional: Set the model's scale
        //     },
        //     // called while loading is progressing
        //     function ( xhr ) {
        //         console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        //     },
        //     // called when loading has errors
        //     function ( error ) {
        //         console.log( 'An error happened', error );
        //     }
        // );
        
        // 바닥을 위한 평면 지오메트리 생성
        // const planeGeometry = new THREE.PlaneGeometry(100, 100);
        // // 바닥에 적용할 머티리얼 생성
        // const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
        // // 메쉬 생성
        // const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        // // 바닥을 x-z 평면에 놓기 위해 회전
        // planeMesh.rotation.x = -Math.PI / 2;
        // // 씬에 추가
        // scene.add(planeMesh);

        //// 벽 생성
        // var wallWidth = 60; // 벽의 너비
        // var wallHeight = 50; // 벽의 높이
        // var wallDepth = 0.5; // 벽의 깊이

        // // 벽을 만듭니다.
        // var wallGeometry = new THREE.BoxGeometry( wallWidth, wallHeight, wallDepth );
        // var wallMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff } );
        // var wall = new THREE.Mesh( wallGeometry, wallMaterial );
        // wall.position.set(0,0,-10)
        // scene.add( wall );
     }

     _setupCamera() {
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.set(0, 0, 20);
        // camera.lookAt(0,0,20)
        this._camera = camera
    }
     _setupLight(candle) {
        const light = new THREE.PointLight(0xFFE699)
        light.intensity = 5
        light.distance = 15
        light.decay = 1
        light.position.set(0,0,0)
        
        // 광원의 영향 범위
        // light.position = 1;
        // light.target.position.set(0,0,0)
        // this._scene.add(light.target)

        const helper = new THREE.PointLightHelper(light)
        this._scene.add(helper)
        this._lightHelper = helper
        this._light = light

        candle.getWorldPosition(this._light.position)
        this._light.position.setY(this._light.position.y + 3)

        // 임시
        const AmbientLight = new THREE.AmbientLight( 0x404040 ); // soft white light

        this._scene.add(this._light, AmbientLight)

        // console.log(candle)
        // this._light.position.set(candle.getWorldPosition())
    }

    _setupControls() {
        // orbit controls
        const controls = new OrbitControls(this._camera, this._renderer.domElement)
        controls.minDistance = 2;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI / 2.5;
        controls.update()
    }

    async _initModel() {
        const obj = new THREE.Object3D()

        const deskModel = await this. _loadDesk()
        const candle = await this._loadCandle()
        deskModel.add(candle)
        obj.add(deskModel)

        const chair = await this._loadChair()
        obj.add(chair)
        
        const firePlace = await this._loadFirePlace()
        const fire = await this._loadFire()
        firePlace.add(fire)

        obj.add(firePlace)

        this._scene.add(obj)
        this._setupLight(candle)
    }

    async _loadCandle() {
         return new Promise((resolve)=> {
         this._loader.load(
            '/three_candles/scene.gltf',
                function ( gltf ) {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 

                    const scaleFactor = 0.000015;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                
                    model.position.set(0.4, 0.58, -0.1);

                    const animations = gltf.animations;
                    const mixer = new THREE.AnimationMixer( model );
                    const action = mixer.clipAction( animations[ 0 ] );
                    action.play();
                    function animate() {
                        requestAnimationFrame( animate );
                        mixer.update( 0.01 );
                    }
                    animate();
                    
                    resolve(model)
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
        })
    }

    async _loadDesk() {
        // 책상
        return new Promise((resolve)=> {
            this._loader.load(
                '/simple_desk/scene.gltf',
                function ( gltf ) {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 
    
                    const scaleFactor = 10;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
                    // Optional: Set the model's initial position and rotation
                    model.position.set(0, 0, 0);
                    // model.rotation.set(0,5,0)
                    // Optional: Set the model's scale

                    resolve(model)
                }.bind(this),
                // called while loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened', error );
                }
            )
        })
    }

    async _loadChair() {
        return new Promise((resolve)=> {
            // 의자
            this._loader.load(
                '/antique_chair/scene.gltf',
                ( gltf ) => {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 

                    const scaleFactor = 4;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    //model.normalize()

                    // Optional: Set the model's initial position and rotation
                    model.position.set(0.2, 6, 10);
                    
                    model.rotation.y += Math.PI;
                    resolve(model)

                    // Optional: Set the model's scale
                },
                // called whrenderile loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened', error );
                }
            )
        })
    }

    // async _loadFire() {
    //     return new Promise((resolve)=> {
    //         // 불
    //         this._loader.load(
    //             '/animated_fire/scene.gltf',
    //             ( gltf ) => {
    //                 // add the loaded glTF model to the scene
    //                 const model = gltf.scene 

    //                 const scaleFactor = 1;
    //                 model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    //                 const animations = gltf.animations;
    //                 const mixer = new THREE.AnimationMixer( model );
    //                 console.log(animations)
    //                 const action = mixer.clipAction( animations[ 0 ] );
                    
    //                 const animationActions = []
    //                 animationActions.push(action)
    //                 // animationsFolder.add(animations, 'default')
    //                 action.play();

    //                 const clock = new THREE.Clock()
    //                 function animate() {
    //                     requestAnimationFrame( animate );
    //                     mixer.update(  clock.getDelta()  );
    //                 }
    //                 animate();

    //                 // Optional: Set the model's initial position and rotation
    //                 model.position.set(0.4, -0.65, 0);
                    
    //                 model.rotation.y -= Math.PI/2;
    //                 resolve(model)
    //             },
    //             // called whrenderile loading is progressing
    //             function ( xhr ) {
    //                 console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    //             },
    //             // called when loading has errors
    //             function ( error ) {
    //                 console.log( 'An error happened', error );
    //             }
    //         )
    //     })
    // }  

    async _loadFire() {
        return new Promise((resolve)=> {
            const loader = new FBXLoader();
            loader.load(
                '/fire/Animated_fire.fbx',
                ( object ) => {

                    const scaleFactor = 0.01;
                    object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // 로드 완료 후 처리할 내용
                    const mixer = new THREE.AnimationMixer( object );
            
                    // 에니메이션 추가
                    const animation = object.animations[ 0 ];
                    const action = mixer.clipAction( animation );
                    action.play();
            
                    // 렌더링 반복 처리 함수
                    const clock = new THREE.Clock();
                    function render() {
                        requestAnimationFrame( render );
                        const delta = clock.getDelta();
                        mixer.update( delta );
                    }
                    render();
                    
                    object.position.set(0.4, -0.65, 0);
                    
                    object.rotation.y -= Math.PI/2;
                    resolve(object)
                },
                ( xhr ) => {
                    // 로딩 중 처리할 내용
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                ( error ) => {
                    // 에러 발생 시 처리할 내용
                    console.error( error );
                }
            );            
        })
    }

    async _loadFirePlace() {
        return new Promise((resolve)=> {
            // 불
            this._loader.load(
                '/fireplace/scene.gltf',
                ( gltf ) => {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 

                    const scaleFactor = 5;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // Optional: Set the model's initial position and rotation
                    model.position.set(15, 5, 20);
                    
                    model.rotation.y -= Math.PI;
                    resolve(model)
                },
                // called whrenderile loading is progressing
                function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                // called when loading has errors
                function ( error ) {
                    console.log( 'An error happened', error );
                }
            )
        })
    }  
    
	resize() {
		const width = this._myDIv.clientWidth;
		const height = this._myDIv.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render() {
		this._renderer.render(this._scene, this._camera);
		// this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}

	// update(time) {
	// 	time *= 0.001;
	// 	// this._cube.rotation.x = time;
	// 	// this._cube.rotation.y = time;
	// }
}