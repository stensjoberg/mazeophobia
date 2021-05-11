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
import { debug, SceneTypes } from './constants';
import { log } from './helper'
import EndScene from './components/scenes/EndScene.js';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera();
const controls = new PlayerControls(camera, document.body);
const renderer = new WebGLRenderer({ antialias: true });
const clock = new Clock();


// Set up camera
camera.position.set(40, 3, 40);
camera.lookAt(new Vector3(1, 3, 1));

// bounding box for camera
//const playerBox = new Box3();
//camera.add(playerBox);
//console.log(camera)

// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
/*const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 16;
controls.update();*/

// ========================================================================
// Scene Transitions
// ========================================================================

let currScene = SceneTypes.Begin;
let beginScene;
let gameScene;
let endScene;
let isGameWin = false;
let secondsElapsed = 0;

const startToGameHandler = () => {
    changeToGame(beginScene);
    beginScene = undefined;
}

function changeToGame(initScene) {
    initScene.dispose();
    console.log("Game starting...")
    gameScene = new GameScene(camera);
    controls.enable();
    currScene = SceneTypes.Game;
}

// ========================================================================
// Rendering
// ========================================================================

beginScene = new BeginScene(startToGameHandler);


// Actually renders scene and runs updates
function renderScene(s, timeStamp) {
    renderer.render(s, camera);
    s.update && s.update(timeStamp);
}

// Ye olde game loop
const onAnimationFrameHandler = (timeStamp) => {
    if (currScene === SceneTypes.Game) {
        controls.update(gameScene, clock.getDelta());
        if (gameScene.foundBeacon(camera)) {
            currScene = SceneTypes.End;
            isGameWin = true;
        }
        let time = Math.floor(clock.getElapsedTime());
        if (time > secondsElapsed) {
            secondsElapsed += 1;
            gameScene.decrementSanity();
        }
        if (gameScene.insane()) {
            currScene = SceneTypes.End;
            isGameWin = false;
        }
        renderScene(gameScene, timeStamp);
    }

    if (currScene === SceneTypes.Begin) {
        renderScene(beginScene, timeStamp);
    }

    if (currScene === SceneTypes.End) {
        controls.unlock();
        endScene = new EndScene(isGameWin, startToGameHandler);
        renderScene(endScene, timeStamp);
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
