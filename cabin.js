 import * as THREE from './threejs/build/three.module.js';
   import { Rhino3dmLoader } from './threejs/examples/jsm/loaders/3DMLoader.js';
   import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';
   import { NumberKeyframeTrack } from './threejs/src/animation/tracks/NumberKeyframeTrack.js';
   import { AnimationClip } from './threejs/src/animation/AnimationClip.js';
   import { AnimationMixer } from './threejs/src/animation/AnimationMixer.js';
   import { Clock } from './threejs/src/core/Clock.js';


  	const container = document.getElementById('modal');
	const cModal = document.getElementById("c");
    const modal = document.getElementById("modalFrame");
    const modalLoading = document.getElementById("modalLoad");
	const modalBar = document.getElementById("modalBar");
	const modalEnter = document.getElementById('modalEnter');

	const modalBarBorder = document.getElementById("modalBarBorder");
	const modalLoadText = document.getElementById('modalLoadText');

	let barWidth =0;
	let barWidthMax=10;
	let controls;
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas}); 
	const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	const scene = new THREE.Scene();

	const whiteColour = new THREE.Color(1,1,1);
	const loaderText = new THREE.TextureLoader();
	const clock = new Clock();
	const times = [0, 1, 2, 3, 4, 5];
	const values = [1,1, 1, 0.6, 0.3, 0];
	let startTime = new Date();
	let currentTime = new Date();
	let elapsedTime =  0;

	const fadeBox = new THREE.BoxGeometry (25,25,25);
	fadeBox.castShadows = false;
	const materialFB = new THREE.MeshPhongMaterial({color: 0x000000,side: THREE.DoubleSide,transparent: true, opacity: 0.50});
	const fadeBoxM = new THREE.Mesh(fadeBox, materialFB);
 	const itemsLoaded = 0;
	const itemsTotal = 0;
	let allLoaded = false;

	const opacityFB = new NumberKeyframeTrack('fadeBoxM.material.opacity', times, values);
	const tracks = [opacityFB];
	const trackLength = -1;
	const clip = new AnimationClip('fade', trackLength, tracks);
	const mixer = new AnimationMixer(fadeBoxM);
	const action = mixer.clipAction(clip);
	const timeout = false;
	let delta = clock.getDelta();
  	const texture = loaderText.load('texture/background.jpg',
    () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;

    });
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );


	main();	
	animateLoadBar();

    function main() {
		const manager = new THREE.LoadingManager();
		manager.onProgress = function(url, itemsLoaded, itemsTotal)
		{
			
			
			if (url == "/model/house/furniture.3dm")
			{
				allLoaded=true;
			}
		}
		manager.onLoad = function () {
			if (allLoaded == true){
				modalBar.style.display = "none";
				modalBarBorder.style.display = "none";
				modalLoadText.style.display = "none";
				modalEnter.style.display = "block";
				animate();
			}
		}
	
		const loader = new Rhino3dmLoader(manager);
		loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/' );
	
		
		THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );
		renderer.setSize( modal.offsetWidth, modal.offsetHeight );
        camera.position.x = 50;
		camera.position.y = 50;
		camera.position.z = 50;
		const light = new THREE.HemisphereLight( 0xfffff6, 0x080820, 1 );
		light.rotation.x = -Math.PI/2;
		scene.add( light );

		renderer.toneMapping = THREE.ReinhardtToneMapping;
		renderer.toneMappingExposure = 1.1;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		const dLightColor = 0xFFFFFF;
  		const dLightIntensity = 0.15;
		const dLight = new THREE.DirectionalLight(dLightColor, dLightIntensity);
		dLight.shadow.mapSize.width = 1000;  
		dLight.shadow.mapSize.height = 1000; 
		dLight.shadow.camera.near = 0.5;
		dLight.shadow.camera.far = 500     
		dLight.castShadow = true;
		dLight.position.set(-40, 75, 95);
 		dLight.target.position.set(-5, 0, 0);
		dLight.shadow.camera.near = near;       
		dLight.shadow.camera.far = far;      
		dLight.shadow.camera.left = -500;
		dLight.shadow.camera.bottom = -500;
		dLight.shadow.camera.right = 500;
		dLight.shadow.camera.top	= 500;
  		scene.add(dLight);
  		scene.add(dLight.target);


	
		fadeBoxM.position.set(50, 50, 50);
		fadeBoxM.castShadows = false;
		action.clampWhenFinished = true;
		action.Loop = THREE.LoopOnce;
		action.noLoop = true;
		action.play(); 
		startTime = new Date();
	

		const roofTextMap = new THREE.ImageUtils.loadTexture("/materials/shingles/shingleBM.jpg");
		roofTextMap.repeat.set(5,5);
		roofTextMap.wrapS = THREE.repeatwrapping;
		roofTextMap.wrapT = THREE.repeatwrapping;
		const roofText = new THREE.ImageUtils.loadTexture("/materials/shingles/shingle.jpg");
		roofText.repeat.set(5,5);
		roofText.wrapS = THREE.repeatwrapping;
		roofText.wrapT = THREE.repeatwrapping;
		const roofMaterial= new THREE.MeshPhongMaterial({
			map: roofText,
			bumpMap: roofTextMap,
			bumpScale:0.1,
			shininess: 0,
			side: THREE.DoubleSide,
		}
		);

		const wallText = new THREE.ImageUtils.loadTexture("/materials/wood3/wood.jpg");
		const wallDis = new THREE.ImageUtils.loadTexture("/materials/wood/wood_dis.png"); 
		const wallMaterial= new THREE.MeshPhongMaterial({
			map: wallText,
			shininess: 0,
			side: THREE.DoubleSide,
			
		}
		);

		const floorText = new THREE.ImageUtils.loadTexture("/materials/wood2/woodfloor.jpg");
		const floorMaterial= new THREE.MeshPhongMaterial({
			map: floorText,
			shininess: 0,
			side: THREE.DoubleSide,
			
		}
		);

		const glassMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          refractionRatio: 0.8,
		 opacity: 0.5,
		  transparent: true
        });

		const metalMaterial = new THREE.MeshPhongMaterial({
          color: 0x000000,
      
	
        });

		const grassText = new THREE.ImageUtils.loadTexture("/materials/grass/grass_DIFFUSE.png");
		grassText.repeat.set(50,50);
		grassText.wrapS = THREE.repeatwrapping;
		grassText.wrapT = THREE.repeatwrapping;
		const grassTextBM = new THREE.ImageUtils.loadTexture("/materials/grass/grass_DISP.png");
		grassTextBM.repeat.set(50,50);
		grassTextBM.wrapS = THREE.repeatwrapping;
		grassTextBM.wrapT = THREE.repeatwrapping;
		const grassMaterial= new THREE.MeshPhongMaterial({
			map: grassText,
			shininess: 0,
			displacementMap: grassTextBM,
			displacementScale: 0.1,
			side: THREE.DoubleSide,
			
		}
		);

		const trunkMaterial = new THREE.MeshPhongMaterial({
          color: 0x88614a,
		  side: THREE.DoubleSide,
        });

		const tree1Material = new THREE.MeshPhongMaterial({
          color: 0x59884a,
		  side: THREE.DoubleSide,
        });

		const tree2Material = new THREE.MeshPhongMaterial({
          color: 0x405d25,
		  side: THREE.DoubleSide,
        });

		const tree3Material = new THREE.MeshPhongMaterial({
          color: 0xb09739,
		  side: THREE.DoubleSide,
        });

		const tree4Material = new THREE.MeshPhongMaterial({
          color: 0x396a1f,
      
		  side: THREE.DoubleSide,
        });


		
		
		loader.load( '/model/house/tree4.3dm', function ( object ) {	
			object.traverse( function( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = tree4Material;
			}
		} );
		object.castShadow = true;
		object.rotation.x = -Math.PI/2;
		scene.add( object );

	
			loader.load( '/model/house/tree3.3dm', function ( object ) {	
				object.traverse( function( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = tree1Material;
				}
			} );
			object.castShadow = true;
			object.rotation.x = -Math.PI/2;
			scene.add( object );

				loader.load( '/model/house/tree2.3dm', function ( object ) {	
					object.traverse( function( child ) {
					if ( child instanceof THREE.Mesh ) {
						child.material = tree2Material;
					}
				} );
				object.castShadow = true;
				object.rotation.x = -Math.PI/2;
				scene.add( object );

				loader.load( '/model/house/tree1.3dm', function ( object ) {	
					object.traverse( function( child ) {
					if ( child instanceof THREE.Mesh ) {
						child.material = tree3Material;
					}
				} );
				object.castShadow = true;
				object.rotation.x = -Math.PI/2;
				scene.add( object );
  
					loader.load( '/model/house/roof.3dm', 
						function ( object ) {	
							object.traverse( function( child ) {
							if ( child instanceof THREE.Mesh ) {
								child.material = roofMaterial;
							}
						} );
						object.castShadow = true;
						object.rotation.x = -Math.PI/2;
						scene.add( object );

							loader.load( '/model/house/structure.3dm',
							function ( object ) {	
								object.traverse( function( child ) {
								if ( child instanceof THREE.Mesh ) {
									child.material = wallMaterial;
								}
							} );
							object.castShadow = true;
							let structObj = object;
							structObj.rotation.x = -Math.PI/2;
							scene.add( structObj );

								loader.load( '/model/house/walls.3dm', 
								function ( object ) {	
									object.traverse( function( child ) {
									if ( child instanceof THREE.Mesh ) {
										child.material = wallMaterial;
									}
								} );
								object.castShadow = true;
								object.rotation.x = -Math.PI/2;
								scene.add( object );

										loader.load( '/model/house/trunks.3dm', function ( object ) {	
											object.traverse( function( child ) {
											if ( child instanceof THREE.Mesh ) {
												child.material = trunkMaterial;
											}
										} );
										object.castShadow = true;
										object.rotation.x = -Math.PI/2;
										scene.add( object );

												loader.load( '/model/house/glass.3dm', function ( object ) {	
													object.traverse( function( child ) {
													if ( child instanceof THREE.Mesh ) {
														child.material = glassMaterial;
													}
												} );
												object.rotation.x = -Math.PI/2;
												scene.add( object );
				
													loader.load( '/model/house/fireplace.3dm', function ( object ) {	
														object.traverse( function( child ) {
														if ( child instanceof THREE.Mesh ) {
															child.material = metalMaterial;
														}
													} );
													object.castShadow = true;
													object.rotation.x = -Math.PI/2;
													scene.add( object );

													loader.load( '/model/house/groundplane.3dm', function ( object ) {	
														object.traverse( function( child ) {
														if ( child instanceof THREE.Mesh ) {
															child.material = grassMaterial;
														}
													} );
													object.receiveShadow = true;
													object.rotation.x = -Math.PI/2;
													scene.add( object );
				
														loader.load( '/model/house/floors.3dm',
														function ( object ) {	
														object.traverse( function( child ) {
														if ( child instanceof THREE.Mesh ) {
															child.material = wallMaterial;
														}
														} );
														object.castShadow = true;
														object.rotation.x = -Math.PI/2;
														scene.add( object );
														

															loader.load( '/model/house/furniture.3dm', function ( object ) {
																object.castShadow = true;
																let furnObj = object;
																furnObj.rotation.x = -Math.PI/2;
																scene.add( furnObj );

				
															} );
														} );
													} );
												} );
											} );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
      		  });


		scene.fog = new THREE.Fog(0xfffff,10,1000);
		scene.fog.color.setHSL( 0.51, 0.6, 0.6 );

		controls = new OrbitControls( camera, renderer.domElement );
    }
	
	function animateLoadBar()
	{
		if (allLoaded==false)
		{
			requestAnimationFrame( animateLoadBar );
			delta = clock.getDelta();
			mixer.update( delta );
			currentTime = new Date();
			elapsedTime = currentTime - startTime;
		
			barWidth = (2*elapsedTime/1000);
			if (barWidth >= 40)
				barWidth = 40;
			modalBar.style.width = barWidth + "%";
		}
		else
			cancelAnimationFrame( animateLoadBar );
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();

		renderer.render( scene, camera );

	}
	


	
	function onDocumentMouseDown( event ) {
		if (event.target == modalEnter) {
   			 modal.style.display = "none";
  		}
	}
