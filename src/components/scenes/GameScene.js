import * as Dat from 'dat.gui';
import { Scene, Color, SpotLight, SpotLightHelper, PointLight, PointLightHelper, Vector3, MeshLambertMaterial, BoxGeometry, Mesh, Object3D, Box3, MeshPhongMaterial} from 'three';
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

        // Set background to light blue
        this.background = new Color(0x7ec0ee);

        
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
        this.cellWidth = 4;
        this.n = 10;

        // Player spawn already set at (0, 3, 0) in app.js
        // Set finish spot at opposite diagonal end of maze
        // let finishLight = new PointLight(0xffffff, 2, 40, 0.2);
        // finishLight.position.set(this.cellWidth*(this.n - 1), 3, this.cellWidth*(this.n - 1));
        // this.add(finishLight);
        // this.add(new PointLightHelper(finishLight));
        // TODO add new finish beacon


        // Let's put a floor ithis.n the middle of the maze
        const material = new MeshPhongMaterial( {color: 0x1c1c1c } );
        let geometry = new BoxGeometry( this.cellWidth*(this.n + 2), this.cellWidth/8, this.cellWidth*(this.n + 2));

        let floor = new Mesh(geometry, material)
        this.add(floor);
        floor.position.x = (this.cellWidth*this.n)/2;
        floor.position.z = (this.cellWidth*this.n)/2;

        // Setup for wall creation
        geometry = new BoxGeometry( 9/8*this.cellWidth, 4*this.cellWidth, this.cellWidth/8 );

        // add perimiter walls
        this.walls = [];
        this.addPerimiter(geometry, material);

        // Making a maze
        let maze = new Maze(this.n);
        maze.runKruskals();
        let edges = maze.getEdges();


        // Let's get the maze edges into the scene
        for (let i = 0; i < edges.length; i++) {
            this.walls[i] = new Mesh( geometry, material );
            this.walls[i].position.x = edges[i].x * this.cellWidth;
            this.walls[i].position.z = edges[i].y * this.cellWidth;
            this.walls[i].position.y = 2*this.cellWidth;
            if (edges[i].x_orientation == true) {
                this.walls[i].rotation.y = Math.PI/2
                this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, true);
            }
            else {
                this.walls[i].rotation.y = 0
                this.walls[i].bb = this.calculateBoundingBox(this.walls[i].position.x, this.walls[i].position.z, false);
            }
            this.add(this.walls[i]);
        }

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
            this.walls[i].position.y = 2*this.cellWidth;
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
            this.walls[i].position.y = 2*this.cellWidth;
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
            this.walls[i].position.y = 2*this.cellWidth;
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
            this.walls[i].position.y = 2*this.cellWidth;

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
        let min;
        let max;

        if (rotate) {
            min = new Vector3(xPos - 1, 0, zPos - this.cellWidth / 2);
            max = new Vector3(xPos + 1, 10, zPos + this.cellWidth / 2);
        }
        else {
            min = new Vector3(xPos - (this.cellWidth / 2), 0, zPos - 1);
            max = new Vector3(xPos + (this.cellWidth / 2), 10, zPos + 1);
        }

        return new Box3(min, max);
    }

    findCollisions(camera) {
        for (let i = 0; i < this.walls.length; i++) {
            if (this.walls[i].bb.containsPoint(camera.position)) {
                return this.walls[i].bb;
            }
        }
        return undefined;
    }
}

export default GameScene;
