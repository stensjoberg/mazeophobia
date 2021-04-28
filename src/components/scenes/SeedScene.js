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
        const cellWidth = 4;
        const n = 10;

        // Let's put a floor in the middle of the maze
        let floor = new Floor();
        this.add(floor);
        floor.position.x = (cellWidth*n)/2
        floor.position.z = (cellWidth*n)/2

        // Making a maze
        let maze = new Maze(n);
        maze.runKruskals();
        let edges = maze.getEdges();

        // Let's get the maze edges into the scene
        let walls = [];
        for (let i = 0; i < edges.length; i++) {
            walls[i] = new Wall();
            if (edges[i].x_orientation == true) {
                walls[i].rotation.y = Math.PI/2
            }
            walls[i].position.x = edges[i].x * cellWidth;
            walls[i].position.z = edges[i].y * cellWidth;
            this.add(walls[i]);
        }

        // Add perimeter walls around maze square
        // x: 0, z: 0.5 maze
        let len = walls.length;
        for (let i = len; i < len + n; i++) {
            // from 0,0 to 0,maze
            walls[i] = new Wall();
            walls[i].position.x = 0; 
            walls[i].position.z = i * cellWidth;
            this.add(walls[i]);
        }
        // x: maze, z: 0.5 maze
        // TODO change walls and floor meshes and textures 
        
        let wallText = [];
        font.then(font => {
            for (let i = 0; i < walls.length; i++) {
                console.log(walls[i])
                wallText[i] = addText(font, walls[i].id.toString(), walls[i].position.x, walls[i].position.y + 2*cellWidth, walls[i].position.z, walls[i].x_orientation);
                this.add(wallText[i]);
            }
        });

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
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
