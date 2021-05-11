import * as Dat from 'dat.gui';
import { Scene, Color, SpotLight, CubeTextureLoader, PointLight, PointLightHelper, Vector3, MeshLambertMaterial, BoxGeometry, Mesh, Object3D, Box3, MeshPhongMaterial, SphereGeometry, MeshBasicMaterial, TextureLoader} from 'three';
import { debug } from '../../constants';
import { Floor, Wall, } from 'objects';
import { BasicLights } from 'lights';
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
        // PLAYER FLASHLIGHT
        // =================================================================================
        // Pretty weak and narrow per arguments
        if (debug.flashlight) {
            this.flashlight = new SpotLight(0xffffff, 8, 400, Math.PI/2, 0.3);
        }
        else {
            this.flashlight = new SpotLight(0xffffff, 2, 40, Math.PI/8, 0.6);
        }
        
        //this.flashlight.target = this.camera;
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

        // Player spawn already set at (0, 3, 0) in app.js
        // Set finish spot at opposite diagonal end of maze
        /*let finishLight = new PointLight(0xfceea7, 2, 40, 0.2);
        finishLight.position.set(this.cellWidth*(this.n - 1), 3, this.cellWidth*(this.n - 1));
        //this.add(finishLight);
        this.add(new PointLightHelper(finishLight));*/
        // TODO add new finish beacon
        let beaconGeometry = new SphereGeometry(1.0, 4, 2);
        let beaconMaterial = new MeshBasicMaterial({wireframe: true, fog: false, toneMapped: false, color: 0xfceea7});
        let beacon = new Mesh(beaconGeometry, beaconMaterial);
        beacon.position.set(this.cellWidth*(this.n - 1), 3, this.cellWidth*(this.n - 1));
        this.add(beacon)

        // get bounding box of beacon
        let minBeacon = beacon.position.clone().sub(new Vector3(1,1,1));
        let maxBeacon = beacon.position.clone().add(new Vector3(1,1,1));
        this.beaconBB = new Box3(minBeacon, maxBeacon);

        // Let's put a floor ithis.n the middle of the maze
        const floorMaterial = new MeshPhongMaterial( {color: 0x1c1c1c } );
        let geometry = new BoxGeometry( this.cellWidth*(this.n + 2), this.cellWidth/8, this.cellWidth*(this.n + 2));

        let floor = new Mesh(geometry, floorMaterial)
        this.add(floor);
        floor.position.x = (this.cellWidth*this.n)/2;
        floor.position.z = (this.cellWidth*this.n)/2;

        /*let ceiling = new Mesh(geometry, material)
        this.add(ceiling);
        ceiling.position.x = (this.cellWidth*this.n)/2;
        ceiling.position.z = (this.cellWidth*this.n)/2;
        ceiling.position.y = 4*this.cellWidth;*/

        // Setup for wall creation
        const wallMaterial = new MeshPhongMaterial( {color: 0x1c1c1c,
                                                     map: new TextureLoader().load('src/components/textures/walls/bricktexture.jpg') } );

        const width = 17/16*this.cellWidth;
        this.height = 3/2*this.cellWidth;
        const depth = this.cellWidth/16;
        geometry = new BoxGeometry(width, this.height, depth);

        // add perimiter walls
        this.walls = [];

        // Making a maze
        let maze = new Maze(this.n);
        maze.runKruskals();
        let edges = maze.getEdges();


        // Let's get the maze edges into the scene
        for (let i = 0; i < edges.length; i++) {
            this.walls[i] = new Mesh( geometry, wallMaterial);
            this.walls[i].position.x = edges[i].x * this.cellWidth;
            this.walls[i].position.z = edges[i].y * this.cellWidth;
            this.walls[i].position.y = this.height/2;
            if (edges[i].x_orientation == true) {
                this.walls[i].rotation.y = Math.PI/2
                this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, true);
            }
            else {
                this.walls[i].rotation.y = 0;
                this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, false);
            }
            this.add(this.walls[i]);
        }

        this.addPerimiter(geometry, wallMaterial);

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
        //console.log(this.camera.position)
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
