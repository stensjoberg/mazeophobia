import * as Dat from 'dat.gui';
import { Scene, SpotLight, CubeTextureLoader, Vector3, BoxGeometry, Mesh, Box3, SphereGeometry, MeshStandardMaterial, MeshBasicMaterial, TextureLoader, AudioListener} from 'three';
import { debug } from '../../constants';
import { Floor, Wall, } from 'objects';
import Maze from './Maze';
import { addText, getFont } from '../../helper';

class GameScene extends Scene {

    

    constructor(camera) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            updateList: [],
        };

        // Add camera to scene for flashlight tracking
        this.camera = camera;
        this.add(this.camera);

        // Loading font for debug use later
        const font = getFont();

        // Set background to spooky color (doesn't matter if there is ceiling)
        this.addSkyBackground();
        this.playerSanity = 100;


        // =================================================================================
        // AUDIO SETUP
        // =================================================================================

        const listnr = new AudioListener();
        // =================================================================================
        // PLAYER FLASHLIGHT
        // =================================================================================
        // Pretty weak and narrow per arguments
        if (debug.flashlight) {
            this.baseLightIntensity = 1;
            this.baseLightLength = 100;
            this.baseLightAngle = Math.PI/3;
        }
        else {
            this.baseLightIntensity = 1;
            this.baseLightLength = 100;
            this.baseLightAngle = Math.PI/8;
        }

        this.flashlight = new SpotLight(0xffffff, this.baseLightIntensity, this.baseLightLength, this.baseLightAngle, 0.6);
        
        this.add(this.flashlight);
        // Since we'll be updating the target position, it needs to be part of the scene
        this.add(this.flashlight.target);
        this.updateFlashlight();

        // =================================================================================
        // MAZE GENERATION
        // =================================================================================
        // Defines size of maze
        this.cellWidth = 10;
        this.n = 6;

        // Let's put a floor ithis.n the middle of the maze
        const textureLoader = new TextureLoader();
        const floorMaterial = new MeshStandardMaterial( {
                                                      map: textureLoader.load('src/components/textures/floor/soiltexture.jpg') } );

        let geometry = new BoxGeometry( this.cellWidth*(this.n + 2), this.cellWidth/8, this.cellWidth*(this.n + 2));

        let floor = new Mesh(geometry, floorMaterial)
        this.add(floor);
        floor.position.x = (this.cellWidth*this.n)/2;
        floor.position.z = (this.cellWidth*this.n)/2;

        // Player spawn already set at (0, 3, 0) in app.js
        // Set finish spot at opposite diagonal end of maze
        let beaconGeometry = new SphereGeometry(1.0, 4, 2);
        let beaconMaterial = new MeshBasicMaterial({wireframe: true, fog: false, toneMapped: false, color: 0xfceea7});

        let beaconObj = new Mesh(beaconGeometry, beaconMaterial);
        beaconObj.position.set(this.cellWidth*(this.n - 1), 6, this.cellWidth*(this.n - 1));

        let skyBeaconGeometry = new SphereGeometry(2.0, 4, 2);
        let beaconSky = new Mesh(skyBeaconGeometry, beaconMaterial);
        beaconSky.position.set(this.cellWidth*(this.n - 1), 100, this.cellWidth*(this.n - 1));
        
        this.add(beaconObj);
        this.add(beaconSky);

        // get bounding box of beacon
        let minBeacon = beaconObj.position.clone().sub(new Vector3(1,1,1));
        let maxBeacon = beaconObj.position.clone().add(new Vector3(1,1,1));
        this.beaconBB = new Box3(minBeacon, maxBeacon);

        // Setup for wall creation
        const wallMaterials = [
            new MeshStandardMaterial({ map: textureLoader.load('src/components/textures/walls/bricktexture_short.jpg')}),
            new MeshStandardMaterial({ map: textureLoader.load('src/components/textures/walls/bricktexture_short.jpg')}),
            new MeshStandardMaterial({ map: textureLoader.load('src/components/textures/walls/bricktexture_short.jpg')}),
            new MeshStandardMaterial({ map: textureLoader.load('src/components/textures/walls/bricktexture_short.jpg')}),
            new MeshStandardMaterial({ map: textureLoader.load('src/components/textures/walls/bricktexture.jpg')}),
            new MeshStandardMaterial({ map: textureLoader.load('src/components/textures/walls/bricktexture.jpg')}),
        ];

        // Defines some wall size variables
        this.height = 3/2*this.cellWidth;
        const depth = this.cellWidth/16;

        // add perimiter walls
        this.walls = [];

        // Making a maze
        let maze = new Maze(this.n);
        maze.runKruskals();
        let edges = maze.getEdges();

        geometry = new BoxGeometry(this.cellWidth, this.height, depth);

        // Let's get the maze edges into the scene
        for (let i = 0; i < edges.length; i++) {
            let rot;

            if (edges[i].x_orientation == true) {
                rot = Math.PI/2; 
            }
            else {
                rot = 0;
            }

            this.walls[i] = new Mesh( geometry, wallMaterials);
            this.walls[i].position.x = edges[i].x * this.cellWidth;
            this.walls[i].position.z = edges[i].y * this.cellWidth;
            this.walls[i].position.y = this.height/2;
            this.walls[i].rotation.y = rot;
            this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, edges[i].x_orientation);
            
            this.add(this.walls[i]);
        }

        this.addPerimiter(geometry, wallMaterials);

        // TODO change walls and floor meshes and textures 

        if (false) {
            this.wallText = [];
            font.then(font => {
                for (let i = 0; i < this.walls.length; i++) {
                    this.wallText[i] = addText(font, this.walls[i].id.toString(), this.walls[i].position.x, this.walls[i].position.y + 2*this.cellWidth, this.walls[i].position.z, this.walls[i].x_orientation);
                    this.add(this.wallText[i]);
                }
            });
        }
    }

    // borrowed from https://github.com/CoryG89/MoonDemo via https://github.com/gnuoyohes/blenderman
    addSkyBackground() {
        const path = 'src/components/textures/starfield/'; 
        var envMap = new CubeTextureLoader().load( [
              path + 'right.png', // right
              path + 'left.png', // left
              path + 'top.png', // top
              path + 'bottom.png', // bottom
              path + 'back.png', // back
              path + 'front.png' // front
          ] );
      this.background = envMap;
  }

    addPerimiter(geometry, material) {
        // Add perimeter walls around maze square
        // x: 0, z: 0.5 maze
        let len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Mesh( geometry, material );
            // Close side of the maze
            this.walls[i].position.x = -this.cellWidth/2; 
            this.walls[i].position.z = (i - len) * this.cellWidth;
            this.walls[i].position.y = this.height/2;
            this.walls[i].rotation.y = Math.PI/2

            this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, true);
            this.add(this.walls[i]);
        }

        // x: maze, z: 0.5 maze
        len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Mesh( geometry, material );
            // Far side of the maze
            this.walls[i].position.x = (this.n*this.cellWidth) - this.cellWidth/2; 
            this.walls[i].position.z = (i - len)*this.cellWidth;
            this.walls[i].position.y = this.height/2;
            this.walls[i].rotation.y = Math.PI/2

            this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, true);
            this.add(this.walls[i]);
        }
        
        // x: 0.5 maze, z: 0
        len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Mesh( geometry, material );
            // Far side of the maze
            this.walls[i].position.x = (i - len) * this.cellWidth;
            this.walls[i].position.z = -this.cellWidth/2;
            this.walls[i].position.y = this.height/2;
            this.walls[i].rotation.y = 0;

            this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, false);
            this.add(this.walls[i]);
        }

        // x: 0.5 maze, z: maze 
        len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Mesh( geometry, material );
            // Far side of the maze
            this.walls[i].position.x = (i - len)*this.cellWidth;
            this.walls[i].position.z = (this.n*this.cellWidth) - this.cellWidth/2;
            this.walls[i].position.y = this.height/2;

            this.walls[i].rotation.y = 0;

            this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, false);
            this.add(this.walls[i]);
        }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    updateFlashlight() {

        // Get direction of camera to position light and save it 
        let dir = new Vector3();
        this.camera.getWorldDirection(dir);
        dir.normalize();

        // We set the light origin position to right behind our camera view 
        let lightPos = this.camera.position.clone()
        lightPos.addScaledVector(dir, -1);
        this.flashlight.position.copy(lightPos);

        // We readjust position to right in front of camera, this is our target
        lightPos.addScaledVector(dir, 3);
        this.flashlight.target.position.copy(lightPos);

        // We also update the light angle and intensity based on insanity level
        this.flashlight.angle = this.baseLightAngle * this.playerSanity / 100;
        this.flashlight.intensity = this.baseLightIntensity * this.playerSanity / 100;
    }
    update(timeStamp) {
        const { updateList } = this.state;
        this.updateFlashlight();
        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    calculateBoundingBox(xPos, zPos, rotate) {
        const EPS = 0.1;
        let min;
        let max;

        if (rotate) {
            min = new Vector3(xPos - 1, 0, zPos - (this.cellWidth / 2 + 0.5));
            max = new Vector3(xPos + 1, 10, zPos + (this.cellWidth / 2 + 0.5));
        }
        else {
            min = new Vector3(xPos - (this.cellWidth / 2 + 0.5), 0, zPos - 1);
            max = new Vector3(xPos + (this.cellWidth / 2 + 0.5), 10, zPos + 1);
        }

        let boundingBox = new Box3(min, max);
        boundingBox.expandByScalar(EPS);

        return boundingBox;
    }

    findCollisions(camera) {
        for (let i = 0; i < this.walls.length; i++) {
            if (this.walls[i].bb.containsPoint(camera.position)) {
                return this.walls[i].bb;
            }
        }
        return undefined;
    }

    foundBeacon(camera) {
        return this.beaconBB.containsPoint(camera.position);
    }

    decrementSanity() {
        this.playerSanity--;
    }

    insane() {
        return this.playerSanity == 0;
    }
}

export default GameScene;
