import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';
import { Wall } from '../objects/Wall';

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
        const maze_width = 5;
        const maze_depth = 5;
        const cell_width = 4;

        function index(u, v) {
            return u + v * (maze_width + 1);
        }
        this.index = index;

        // Let's add all of the cells to the maze
        // NOTE This can be replaced with a single floor
        // TODO: relace with 1D array and index() function f(x, y) -> i
        let lands = [];
        for (let x = 0; x < maze_width; x++) {
            for (let z = 0; z < maze_depth; z++) {
                lands[index(x, z)] = new Land();
                this.add(lands[index(x, z)]);
                lands[index(x, z)].position.set(x * cell_width, 0, z * cell_width);
            }
        }

        // Let's add all the walls which are edges between y-adjacent cells
        // We set the rotation to zero here
        //
        let y_walls = [];
        for (let x = 0; x < maze_width - 1; x++) {
            for (let z = 0; z < maze_depth - 1; z++) {
                y_walls[index(x, z)] = new Flower(this);
                this.add(y_walls[index(x, z)]);
                y_walls[index(x, z)].position.set((x * cell_width) + cell_width/2, 0, (z * cell_width));
                z_walls[index(x, z)].rotation.y = Math.PI/2;
            }
        }

        // Let's add all the walls which are edges between z-adjacent cells
        // Here, we rotate the walls by 90 degrees in y such that they separate the cells
        let z_walls = [];
        for (let x = 0; x < maze_width - 1; x++) {
            for (let z = 0; z < maze_depth - 1; z++) {
                z_walls[index(x, z)] = new Flower(this);
                this.add(z_walls[index(x, z)]);
                z_walls[index(x, z)].position.set((x * cell_width), 0, (z * cell_width) + cell_width/2);
                z_walls[index(x, z)].rotation.y = 0;
            }
        }

        // TODO apply Kruskal's on all edges in the two lists


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
