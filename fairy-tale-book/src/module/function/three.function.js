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
        // const AmbientLight = new THREE.AmbientLight( 0x404040, 0.2 ); // soft white light
        // this._scene.add(this._light)
        this._scene.add(this._light)

        // console.log(candle)
        // this._light.position.set(candle.getWorldPosition())
    }

    // 벽난로 불에 광원 추가
    _setUpLightOnFire(fire) {
        const light = new THREE.PointLight(0xffad33)
        light.intensity = 1
        light.distance = 100
        // light.decay = 1
        light.position.set(0,0,0)

        this._lightFire = light
        const helper = new THREE.PointLightHelper( this._lightFire)
        this._scene.add(helper)

        fire.getWorldPosition(this._lightFire.position)

        this._scene.add(this._lightFire)
        this._lightFire.position.setY(this._lightFire.position.y + 2)
        this._lightFire.position.setX(this._lightFire.position.x -1)
        // create a particle system to generate the actual flames
        // const flameGeometry = new THREE.Geometry();
        // for (let i = 0; i < 100; i++) {
        // const particle = new THREE.Vector3(
        //     THREE.MathUtils.randFloatSpread(2),
        //     THREE.MathUtils.randFloatSpread(2) + 3,
        //     THREE.MathUtils.randFloatSpread(2)
        // );
        // flameGeometry.vertices.push(particle);
        // }
        // const flameMaterial = new THREE.PointsMaterial({
        // color: 0xff6600,
        // size: 0.1,
        // blending: THREE.AdditiveBlending,
        // transparent: true,
        // });
        // const flameParticles = new THREE.Points(flameGeometry, flameMaterial);
        // this._scene.add(flameParticles
        //     )
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
        
        // const firePlace = await this._loadFirePlace()
        // const fire = await this._loadFire()
        // firePlace.add(fire)
        // obj.add(firePlace)

        // this._loadFloor()
        this._loadFloor()
        // this._loadWall()

        // const clock = await this._loadClock()
        // obj.add(clock)

        // const window = await this._loadWindow()
        // obj.add(window)

        const book = await this._loadBook()
        obj.add(book)

        this._scene.add(obj)
        this._setupLight(candle)
        // this._setUpLightOnFire(fire)
    }

    async _loadCandle() {
         return new Promise((resolve)=> {
         this._loader.load(
            '/three_candles/scene.gltf',
                function ( gltf ) {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 

                    const scaleFactor = 0.00005;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                
                    model.position.set(-0.7, 2.1, -1.6);

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

    _loadWall() {
        this._loader.load('/vintage_wallpaper/scene.gltf', (gltf) => {
            gltf.scene.traverse( (node) => {
                if (node.isMesh) {
                // material로 부터 texture을 추출해, repeat 패턴을 만든다.  
                const texture = node.material.map
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(5, 5);

                const material = new THREE.MeshStandardMaterial({
                    map: texture
                })

                  const geometry = new THREE.PlaneGeometry(40, 20);  
                  // create a mesh by combining the geometry and material
                  const wall = new THREE.Mesh(geometry, material);
      
                  // rotate the floor to be horizontal
                  //   floor.rotation.x = -Math.PI / 2;
                  wall.position.set(5,8.5,-5)
                  // add the floor to the scene
                  this._scene.add(wall);

                  const geometry2 = new THREE.PlaneGeometry(40, 20);  
                  // create a mesh by combining the geometry and material
                  const wall2 = new THREE.Mesh(geometry2, material);
      
                  // rotate the floor to be horizontal
                  wall2.rotation.y = -Math.PI / 2;
                  wall2.position.set(25,8.5, 5)
                  // add the floor to the scene
                  this._scene.add(wall2);

                }
              });
        });
    }

    _loadFloor() {

        const loader = new GLTFLoader();

        // loader.load('/wooden_floor/scene.gltf', (gltf) => {
        //   // gltf.scene에는 모든 객체들이 들어있습니다.
        //   // gltf.scene.children 배열에서 메테리얼을 찾을 수 있습니다.
        //   const scaleFactor = 0.01;
        //   const model = gltf.scene
        //   model.scale.set(scaleFactor, scaleFactor, scaleFactor)
        //   model.position.set(0,3,-10)
        // //   console.log(material)
        // //   // 해당 메테리얼을 다른 객체에 적용할 수 있습니다.
        // //   const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
        //   this._scene.add(model);
        // });
        loader.load('/wooden_floor/scene.gltf', (gltf) => {
            gltf.scene.traverse( (node) => {
                if (node.isMesh) {
                // material로 부터 texture을 추출해, repeat 패턴을 만든다.  
                const texture = node.material.map
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(5, 5);

                const material = new THREE.MeshStandardMaterial({
                    map: texture
                })
                
                //   console.log(material)
                //     mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
                  
                  // this._scene.add(mesh);
                  // do something with the material

                  const geometry = new THREE.PlaneGeometry(40, 30);  
                  // create a mesh by combining the geometry and material
                  const floor = new THREE.Mesh(geometry, material);
      
                  // rotate the floor to be horizontal
                  floor.rotation.x = -Math.PI / 2;
                  floor.position.set(5,0,10)
                  // add the floor to the scene
                  this._scene.add(floor);

                }
              });
        })
    }

    async _loadWindow() {
        // 창문
        return new Promise((resolve)=> {
            this._loader.load(
                '/victorian_window/scene.gltf',
                function ( gltf ) {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 
    
                    const scaleFactor = 0.005;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
                    // Optional: Set the model's initial position and rotation
                    model.position.set(24, 10, 5);
                    model.rotation.y += Math.PI/2;
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

    // async _loadBook() {
    //     return new Promise((resolve)=> {
    //         this._loader.load(
    //             'bookColor/bookColor.gltf',
    //             function ( gltf ) {
    //                 // add the loaded glTF model to the scene
    //                 const model = gltf.scene 
    
    //                 const scaleFactor = 1.5;
    //                 model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    //                 // Optional: Set the model's initial position and rotation
    //                 model.position.set(0, 7, 0);
    //                 // model.rotation.y -= Math.PI/2;

    //                 const animations = gltf.animations;
    //                 console.log(animations)
    //                 const mixer = new THREE.AnimationMixer( model );
    //                 const action = mixer.clipAction( animations[ 0 ] );
    //                 action.play();
    //                 function animate() {
    //                     requestAnimationFrame( animate );
    //                     mixer.update( 0.02 );
    //                 }
    //                 animate();

    //                 resolve(model)
    //             }.bind(this),
    //             // called while loading is progressing
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

    async _loadBook() {
        return new Promise((resolve)=> {
            this._loader.load(
                'bookColor/bookColorUvTest.gltf',
                function ( gltf ) {
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                          // Create a new texture to replace the UV-mapped texture
                          const newTexture = new THREE.TextureLoader().load('/book-cover2-image.jpeg');
                        console.log(newTexture)
                          // Assign the new texture to the existing material
                          child.material.map = newTexture;
                          child.material.needsUpdate = true;
                        }
                      });
                    const model = gltf.scene 
    
                    const scaleFactor = 1;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
                    model.position.set(0, 7, 0);
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

    async _loadDesk() {
        // 책상
        return new Promise((resolve)=> {
            this._loader.load(
                '/antique_office_desk/scene.gltf',
                function ( gltf ) {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 
    
                    const scaleFactor = 3;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
                    // Optional: Set the model's initial position and rotation
                    model.position.set(0, 0, 0);
                    model.rotation.y -= Math.PI/2;
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

    async _loadClock() {
        return new Promise((resolve)=> {
            this._loader.load(
                '/old_wall_clock/scene.gltf',
                function ( gltf ) {
                    // add the loaded glTF model to the scene
                    const model = gltf.scene 
    
                    const scaleFactor = 10;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
                    // 로드 완료 후 처리할 내용
                    // const mixer = new THREE.AnimationMixer( gltf );

                    // // 에니메이션 추가
                    // const animation = gltf.animations[ 0 ];
                    // const action = mixer.clipAction( animation );
                    // action.play();
            
                    // // 렌더링 반복 처리 함수
                    // const clock = new THREE.Clock();
                    // function render() {
                    //     requestAnimationFrame( render );
                    //     const delta = clock.getDelta();
                    //     mixer.update( delta );
                    // }
                    // render();

                    // Optional: Set the model's initial position and rotation
                    model.position.set(0, 10, -4);
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
                    model.position.set(22.5, 4.5, 17);
                    
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