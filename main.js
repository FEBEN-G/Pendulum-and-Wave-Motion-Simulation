import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('#202124');

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 15);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Resize Handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Add a soft spotlight for drama
const spotLight = new THREE.SpotLight(0xffffff, 0.7, 40, Math.PI / 6, 0.3, 1);
spotLight.position.set(0, 15, 10);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

// Pendulum - Rod and Bob
const rodGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4);
const rodMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5, roughness: 0.5 });
const rod = new THREE.Mesh(rodGeometry, rodMaterial);
rod.position.y = -2;
rod.castShadow = true;
rod.receiveShadow = true;

const bobGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const bobMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffd700, metalness: 1, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, reflectivity: 1, emissive: 0xffe066, emissiveIntensity: 0.3 });
const bob = new THREE.Mesh(bobGeometry, bobMaterial);
bob.position.y = -4;
bob.castShadow = true;
bob.receiveShadow = true;

const pendulum = new THREE.Group();
pendulum.add(rod);
pendulum.add(bob);
scene.add(pendulum);

// Wave cubes
const waveCubes = [];
const cubeCount = 30;

for (let i = 0; i < cubeCount; i++) {
  const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
  const material = new THREE.MeshStandardMaterial({ color: 0x00bcd4, emissive: 0x0088aa, emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.4 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = i - cubeCount / 2;
  cube.position.z = -5;
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);
  waveCubes.push(cube);
}

// Ground Plane with Texture
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('https://threejs.org/examples/textures/checker.png');
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);

groundTexture.colorSpace = THREE.SRGBColorSpace;
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture, color: 0x99ccff, metalness: 0.2, roughness: 0.7 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -4.6;
ground.receiveShadow = true;
scene.add(ground);

// Animation
let time = 0;
function animate() {
  requestAnimationFrame(animate);

  time += 0.01;

  // Pendulum oscillation
  pendulum.rotation.z = Math.sin(time) * 0.5;

  // Wave cubes animation
  waveCubes.forEach((cube, i) => {
    cube.scale.y = 1 + Math.sin(time + i * 0.3) * 0.5;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Interaction - Click to change cube color
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener('click', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(waveCubes);

  if (intersects.length > 0) {
    intersects[0].object.material.color.set(0xffff00); // Yellow on click
  }
});

// Load .glb Model
const loader = new GLTFLoader();

loader.load(
  'models/pendulum.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5);
    model.position.set(3, 0, 0); // Place next to main pendulum
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Error loading model:', error);
  }
);



