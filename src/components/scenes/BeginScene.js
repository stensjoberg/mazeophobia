import { startMenu, SceneTypes } from '../../constants';
import { Scene } from 'three'

class BeginScene extends Scene {

    

    constructor(startGameCallback) {
        
        super();
        this.type = SceneTypes.Begin;

        // Let's make a menu
        this.menuElements = [];
        this.menuElements.push(this.makeTextElement(startMenu.titleText));
        this.menuElements.push(this.makeButton(startMenu.startButtonText, startGameCallback));
    }

    

    makeButton(text, clickCallback) {
        let button = document.createElement('button');
        document.body.appendChild(button);
        button.innerHTML = text;
        button.onclick = clickCallback;
        return button;
    }

    makeTextElement(text) {
        let textElem = document.createElement('p');
        document.body.appendChild(textElem);
        textElem.innerHTML = text;
        return textElem;
    }

    kill() {
        for (let e of this.menuElements) {
            e.remove();
        }
        this.dispose();
    }
}

export default BeginScene;