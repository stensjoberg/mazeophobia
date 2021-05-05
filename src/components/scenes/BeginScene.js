import { startMenu } from '../../constants';
import { Scene } from 'three'

class BeginScene extends Scene {

    

    constructor(startGameCallback) {
        
        super();

        // Make menu
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

    dispose() {
        this.menuElements.forEach((menuElement) => menuElement.remove());
        this.menuElements = null;

        super.dispose();
    }
}

export default BeginScene;
