// Adapted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js

import { Euler, Vector3 } from 'three';

class PlayerControls {
	constructor(camera, domElement) {
		this.domElement = domElement;

		this.movementSpeed = 100.0;
		this.velocityFactor = 10.0;

		let isMovingForward = false;
		let isMovingBackward = false;
		let isMovingLeft = false;
		let isMovingRight = false;

		const euler = new Euler(0,0,0,'YXZ');
		const vector = new Vector3();
		const velocity = new Vector3();
		const direction = new Vector3();

		function onMouseMove(event) {
			const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			
			euler.setFromQuaternion(camera.quaternion);

			euler.y -= movementX * 0.002;
			euler.x -= movementY * 0.002;
			euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));

			camera.quaternion.setFromEuler(euler);
		}

		// handle movement
		function onKeyDown(event) {
			switch(event.key) {
				case "w":
					isMovingForward = true;
					break;
				case "a":
					isMovingLeft = true;
					break;
				case "s":
					isMovingBackward = true;
					break;
				case "d":
					isMovingRight = true;
					break;
			}

		}

		function onKeyUp(event) {
			switch(event.key) {
				case "w":
					isMovingForward = false;
					break;
				case "a":
					isMovingLeft = false;
					break;
				case "s":
					isMovingBackward = false;
					break;
				case "d":
					isMovingRight = false;
					break;
			}
		}

		function moveRight(distance) {
			vector.setFromMatrixColumn(camera.matrix, 0);
			camera.position.addScaledVector(vector, distance);
		}

		function moveForward(distance) {
			vector.setFromMatrixColumn(camera.matrix, 0);
			vector.crossVectors(camera.up, vector);
			camera.position.addScaledVector(vector, distance);
		}

		// update the player position
		this.update = function(delta) {
			velocity.x -= velocity.x * this.velocityFactor * delta;
			velocity.z -= velocity.z * this.velocityFactor * delta;

			direction.x = Number(isMovingRight) - Number(isMovingLeft);
			direction.z = Number(isMovingForward) - Number(isMovingBackward);
			
			if (isMovingForward || isMovingBackward) {
				velocity.z -= direction.z * this.movementSpeed * delta;

			}
			if (isMovingLeft || isMovingRight) {
				velocity.x -= direction.x * this.movementSpeed * delta;
			}

			moveForward(-velocity.z * delta);
			moveRight(-velocity.x * delta);
		}

		this.lock = function() {
			this.domElement.requestPointerLock();
		}

		this.unlock = function() {
			this.domElement.exitPointerLock();
		}
		
		this.domElement.addEventListener("mousemove", onMouseMove);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	}
}

export { PlayerControls };