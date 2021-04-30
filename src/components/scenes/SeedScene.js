import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Floor, Wall } from 'objects';
import { BasicLights } from 'lights';
import Maze from './Maze';
import { addText, getFont } from './helper';

class SeedScene extends Scene {

    

    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };


        // Loading font for debug use later
        // This has to be done synchronously for when we want to actually use the font loaded
        const font = getFont();

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        this.add(lights);

        // Defines size of maze
        this.cellWidth = 4;
        this.n = 10;

        // Let's put a floor ithis.n the middle of the maze
        let floor = new Floor();
        this.add(floor);
        floor.position.x = (this.cellWidth*this.n)/2;
        floor.position.z = (this.cellWidth*this.n)/2;

        // add perimiter walls
        this.walls = [];
        this.addPerimiter();
        // Making a maze
        let maze = new Maze(this.n);
        maze.runKruskals();
        let edges = maze.getEdges();

        // Let's get the maze edges into the scene
        for (let i = 0; i < edges.length; i++) {
            this.walls[i] = new Wall();
            if (edges[i].x_orientation == true) {
                this.walls[i].rotation.y = Math.PI/2
            }
            this.walls[i].position.x = edges[i].x * this.cellWidth;
            this.walls[i].position.z = edges[i].y * this.cellWidth;
            this.add(this.walls[i]);
        }




        // TODO change walls and floor meshes and textures 
        
        this.wallText = [];
        font.then(font => {
            for (let i = 0; i < this.walls.length; i++) {
                this.wallText[i] = addText(font, this.walls[i].id.toString(), this.walls[i].position.x, this.walls[i].position.y + 2*this.cellWidth, this.walls[i].position.z, this.walls[i].x_orientation);
                this.add(this.wallText[i]);
            }
        });

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addPerimiter() {
        // Add perimeter walls around maze square
        // x: 0, z: 0.5 maze
        let len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Wall();
            // Close side of the maze
            this.walls[i].position.x = -this.cellWidth/2; 
            this.walls[i].position.z = (i - len) * this.cellWidth;
            this.walls[i].rotation.y = Math.PI/2
            this.add(this.walls[i]);
        }

        // x: maze, z: 0.5 maze
        len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Wall();
            // Far side of the maze
            this.walls[i].position.x = (this.n*this.cellWidth) - this.cellWidth/2; 
            this.walls[i].position.z = (i - len)*this.cellWidth;
            this.walls[i].rotation.y = Math.PI/2
            this.add(this.walls[i]);
        }
        
        // x: 0.5 maze, z: 0
        len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Wall();
            // Far side of the maze
            this.walls[i].position.x = (i - len) * this.cellWidth;
            this.walls[i].position.z = -this.cellWidth/2;
            this.walls[i].rotation.y = 0;
            this.add(this.walls[i]);
        }

        // x: 0.5 maze, z: maze 
        len = this.walls.length;
        for (let i = len; i < len + this.n; i++) {
            // from 0,0 to 0,maze
            this.walls[i] = new Wall();
            // Far side of the maze
            this.walls[i].position.x = (i - len)*this.cellWidth;
            this.walls[i].position.z = (this.n*this.cellWidth) - this.cellWidth/2;
            this.walls[i].rotation.y = 0;
            this.add(this.walls[i]);
        }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        // this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
