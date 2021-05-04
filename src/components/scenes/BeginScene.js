import { startMenu } from '../../constants';
import { Scene } from 'three'

class BeginScene extends Scene {

    

    constructor() {
        
        super();

        // Make menu
        this.menuElementes = [];
        this.menuElementes.push(this.makeTextElement(startMenu.titleText));
        this.menuElementes.push(this.makeButton(startMenu.startButtonText, this.testFunction));
    }

    testFunction() {
        console.log("Game starting...")
    }

    makeButton(text, clickCallback) {
        let button = document.createElement('button');
        document.body.appendChild(button);
        button.innerHTML = text;
        button.onClick = clickCallback;
        return button;
    }

    makeTextElement(text) {
        let textElem = document.createElement('p');
        document.body.appendChild(textElem);
        textElem.innerHTML = text;
        return textElem;
    }


}

export default BeginScene;