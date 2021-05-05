/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3, Clock, Box3, Scene } from 'three';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlayerControls } from './PlayerControls.js'
import { GameScene, BeginScene } from 'scenes';
import { debug } from './constants.js';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera();
const controls = new PlayerControls(camera, document.body);
const renderer = new WebGLRenderer({ antialias: true });
const clock = new Clock();
const SceneStatus = {
    Game: 0,
    Begin: 1,
    End: 2
}

let currScene = SceneStatus.Begin;
let beginScene;
let gameScene;

const startToGameHandler = () => {
    changeToGame(beginScene);
    beginScene = undefined;
}

function changeToGame(initScene) {
    initScene.dispose();
    console.log("Game starting...")
    gameScene = new GameScene(camera);
    controls.enable();
    currScene = SceneStatus.Game;
}

// Set up camera
camera.position.set(0, 3, 0);
camera.lookAt(new Vector3(1, 3, 1));

// bounding box for camera
const playerBox = new Box3();
camera.add(playerBox);
//console.log(camera)

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

//initStartScene();
beginScene = new BeginScene(startToGameHandler);

// Set up controls
/*const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();*/

function handleMovement() {
    const EPS = 0.0001;

    let collision = gameScene.findCollisions(camera);
    if (collision === undefined) {
        controls.update(clock.getDelta());
    }
    // currently just push the camera outside of the bounding box
    else {
        let champDist = Infinity;
        let champAxis = new Vector3();
        let champPoint = new Vector3();

        if (Math.abs(camera.position.x - collision.max.x) < champDist) {
        champDist = Math.abs(camera.position.x - collision.max.x);
        champAxis = new Vector3(1,0,0);
        champPoint = new Vector3(collision.max.x, camera.position.y, camera.position.z);
        }
        if (Math.abs(camera.position.z - collision.max.z) < champDist) {
        champDist = Math.abs(camera.position.z - collision.max.z);
        champAxis = new Vector3(0,0,1);
        champPoint = new Vector3(camera.position.x, camera.position.y, collision.max.z);
        }
        if (Math.abs(camera.position.x - collision.min.x) < champDist) {
        champDist = Math.abs(camera.position.x - collision.min.x);
        champAxis = new Vector3(-1,0,0);
        champPoint = new Vector3(collision.min.x, camera.position.y, camera.position.z);
        }
        if (Math.abs(camera.position.z - collision.min.z) < champDist) {
        champDist = Math.abs(camera.position.z - collision.min.z);
        champAxis = new Vector3(0,0,-1);
        champPoint = new Vector3(camera.position.x, camera.position.y, collision.min.z);
        }

        camera.position.copy(champPoint);
        camera.position.addScaledVector(champAxis, EPS);
    }
}

// Actually renders scene and runs updates
function renderScene(scene, timeStamp) {
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
}

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
    if (currScene == SceneStatus.Game) {
        handleMovement();
        renderScene(gameScene, timeStamp);
    }

    if (currScene == SceneStatus.Begin) {
        renderScene(beginScene, timeStamp);
    }
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
