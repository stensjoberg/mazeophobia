import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';
import { Wall } from '../objects/Wall';
import Maze from './Maze';

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

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        this.add(lights);

        // this doesn't work because the wall texture has a .bin buffer
        // const wall = new Wall(this);
        // this.add(wall);

        // Defines size of maze
        const cell_width = 4;

        const n = 10;

        function index(u, v) {
            return u + v * (n + 1);
        }
        this.index = index;

        // Let's add all of the cells to the maze for visual understanding
        let lands = [];
        for (let x = 0; x < n; x++) {
            for (let z = 0; z < n; z++) {
                lands[index(x, z)] = new Land();
                this.add(lands[index(x, z)]);
                lands[index(x, z)].position.set(x * cell_width, 0, z * cell_width);
            }
        }

        // Making a maze
        let maze = new Maze(n);
        maze.runKruskals();
        let edges = maze.getEdges();

        // Let's get the maze edges into the scene
        let walls = [];
        for (let i = 0; i < edges.length; i++) {
            walls[i] = new Flower(this);
            if (edges[i].x_orientation == true) {
                walls[i].rotation.y = Math.PI/2
            }
            walls[i].position.x = edges[i].x * cell_width;
            walls[i].position.z = edges[i].y * cell_width;
            this.add(walls[i]);
        }

        // TODO add perimetter wall around square
        // TODO change walls and floor meshes and textures 




        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
