import { endMenu } from '../../constants';
import { Scene } from 'three'
import '../../style.css'

class EndScene extends Scene {
	constructor(isGameWin, startGameCallback) {
		super();

		// Make menu
        this.menuElements = [];
		if (isGameWin) {
			this.menuElements.push(this.makeTextElement(endMenu.win.name, endMenu.win.offset));
		}
		else {
			this.menuElements.push(this.makeTextElement(endMenu.lose.name, endMenu.lose.offset));
		}
        
        this.menuElements.push(this.makeButton(endMenu.start.name, endMenu.start.offset, startGameCallback));
	}

	makeButton(text, top, clickCallback) {
        let button = document.createElement('button');
        document.body.appendChild(button);

        button.innerHTML = text;
        button.style.left = (window.innerWidth - button.clientWidth) / 2 + 'px';
        button.style.top = top;
        button.onclick = clickCallback;
        return button;
    }

    makeTextElement(text, top) {
        let textElem = document.createElement('div');
        document.body.appendChild(textElem);

        textElem.innerHTML = text;
        textElem.style.left = (window.innerWidth - textElem.clientWidth) / 2 + 'px';
        textElem.style.top = top;
        return textElem;
    }

    dispose() {
        this.menuElements.forEach((menuElement) => menuElement.remove());
        this.menuElements = null;

        super.dispose();
    }
}

export default EndScene