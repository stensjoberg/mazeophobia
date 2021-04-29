// Adapted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js

import { Euler, Vector3 } from 'three';

class PlayerControls {
	constructor(camera, domElement) {
		this.domElement = domElement;

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.movementSpeed = 400.0;
		this.velocityFactor = 10.0;
		this.mouseSpeed = 0.002;

		const euler = new Euler(0,0,0,'YXZ');
		const vector = new Vector3();
		const velocity = new Vector3();
		const direction = new Vector3();

		this.onMouseMove = function(event) {
			const movementX = event.movementX;
			const movementY = event.movementY;

			euler.setFromQuaternion(camera.quaternion);

			euler.y -= movementX * this.mouseSpeed;
			euler.x -= movementY * this.mouseSpeed;

			euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));

			camera.quaternion.setFromEuler(euler);
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

		this.moveRight = function(distance) {
			vector.setFromMatrixColumn(camera.matrix, 0);
			camera.position.addScaledVector(vector, distance);
		}

		this.moveForward = function(distance) {
			vector.setFromMatrixColumn(camera.matrix, 0);
			vector.crossVectors(camera.up, vector);
			camera.position.addScaledVector(vector, distance);
		}

		// update the player position
		this.update = function(delta) {
			velocity.x -= velocity.x * this.velocityFactor * delta;
			velocity.z -= velocity.z * this.velocityFactor * delta;

			direction.x = Number(this.moveRight) - Number(this.moveLeft);
			direction.z = Number(this.moveForward) - Number(this.moveBackward);
			
			if (this.moveForward || this.moveBackward) {
				velocity.z -= direction.z * this.movementSpeed * delta;

			}
			if (this.moveLeft || this.moveRight) {
				velocity.x -= direction.x * this.movementSpeed * delta;
			}

			this.moveForward(-velocity.z * delta);
			this.moveRight(-velocity.x * delta);
		}
		
		this.domElement.addEventListener("mousemove", this.onMouseMove);
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
	}
}

export { PlayerControls };