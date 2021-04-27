import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './wall_01.gltf';

class Wall extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'wall';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
    }
}

export default Wall;
