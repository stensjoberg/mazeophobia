import { FontLoader, TextGeometry, MeshLambertMaterial, Mesh, MeshBasicMaterial } from 'three';
import { debug } from 'constants'
export function getFont() {
    const floader = new FontLoader();
    return floader.loadAsync("src/components/fonts/Inconsolata_Condensed_SemiBold_Regular.json");
}

export function isWithinRange (text, min, max) {
    // check if text is between min and max length
}

export function addText(font, text, x, y, z, x_orientation) {
            const geometry = new TextGeometry(text, {
                font: font,
                size: 3,
                height: 1,
                curveSegments: 4,
                bevelEnabled: false});
            // TODO make meshPhongMaterial
            const material = new MeshLambertMaterial( {color: 0x003300} );
            const mesh = new Mesh(geometry, material);
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = z;
            if (x_orientation == true) {
                mesh.rotation.y = Math.PI/2
            }
            else {
                mesh.rotation.y = 0;
            }
            return mesh;
}

export function log(text) {
    if (debug.logging) {
        console.log(text);
    }
}