// Adapted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FirstPersonControls.js

class PlayerControls {
	constructor(camera, domElement) {
		this.camera = camera;
		this.domElement = domElement;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.onMouseMove = function(event) {
			
		}

		// handle movement
		this.onKeyDown = function(event) {
			switch(event.key) {
				case "w":
					this.moveForward = true;
					break;
				case "a":
					this.moveLeft = true;
					break;
				case "s":
					this.moveBackward = true;
					break;
				case "d":
					this.moveRight = true;
					break;
			}

		}

		this.onKeyUp = function(event) {
			switch(event.key) {
				case "w":
					this.moveForward = false;
					break;
				case "a":
					this.moveLeft = false;
					break;
				case "s":
					this.moveBackward = false;
					break;
				case "d":
					this.moveRight = false;
					break;
			}
		}

		// update the player position
		this.update = function(delta) {

		}

		
		this.domElement.addEventListener("mousemove", this.onMouseMove);
		this.domElement.addEventListener("keydown", this.onKeyDown);
		this.domElement.addEventListener("keyup", this.onKeyUp);
	}
}