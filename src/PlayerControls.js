// Adapted from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js

import { Euler, Vector3 } from 'three';
import { log } from './helper'
class PlayerControls {
	constructor(camera, domElement) {
		this.camera = camera;
		this.domElement = domElement;

		this.enabled = false;

		this.movementSpeed = 25.0;
		this.velocityFactor = 10.0;
		this.isLocked = false;

		this.isMovingForward = false;
		this.isMovingBackward = false;
		this.isMovingLeft = false;
		this.isMovingRight = false;
		// DEBUG
		this.isMovingUp = false;
		this.isMovingDown = false;

		this.vector = new Vector3();
		this.velocity = new Vector3();
		this.direction = new Vector3();

		

		

		

	}

	// update the player position
	update(delta) {
		this.velocity.x -= this.velocity.x * this.velocityFactor * delta;
		this.velocity.z -= this.velocity.z * this.velocityFactor * delta;
		this.velocity.y -= this.velocity.y * this.velocityFactor * delta;

		this.direction.x = Number(this.isMovingRight) - Number(this.isMovingLeft);
		this.direction.z = Number(this.isMovingForward) - Number(this.isMovingBackward);
		this.direction.y = Number(this.isMovingUp) - Number(this.isMovingDown);
		
		if (this.isMovingForward || this.isMovingBackward) {
			this.velocity.z -= this.direction.z * this.movementSpeed * delta;

		}
		if (this.isMovingLeft || this.isMovingRight) {
			this.velocity.x -= this.direction.x * this.movementSpeed * delta;
		}
		if (this.isMovingUp || this.isMovingDown) {
			this.velocity.y -= this.direction.y * this.movementSpeed * delta;
		}

		this.moveForward(-this.velocity.z * delta);
		this.moveRight(-this.velocity.x * delta);
		this.moveUp(-this.velocity.y * delta);
	}
	
	unlock() {
		domElement.exitPointerLock();
	}		

	onMouseMove(event) {
		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		let euler = new Euler(0, 0,0, "YXZ");

		euler.setFromQuaternion(this.camera.quaternion);

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;
		euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));

		this.camera.quaternion.setFromEuler(euler);
	}

	// handle movement
	onKeyDown(event) {
		switch(event.key) {
			case "w":
				this.isMovingForward = true;
				break;
			case "a":
				this.isMovingLeft = true;
				break;
			case "s":
				this.isMovingBackward = true;
				break;
			case "d":
				this.isMovingRight = true;
				break;
			// DEBUG 
			case "Shift":
				this.isMovingDown = true;
				break;
			case " ":
				this.isMovingUp = true;
				break;
		}

	}

	onKeyUp(event) {
		switch(event.key) {
			case "w":
				this.isMovingForward = false;
				break;
			case "a":
				this.isMovingLeft = false;
				break;
			case "s":
				this.isMovingBackward = false;
				break;
			case "d":
				this.isMovingRight = false;
				break;
			// DEBUG 
			case "Shift":
				this.isMovingDown = false;
				break
			case " ":
				this.isMovingUp = false;
				break;
		}
	}

	moveRight(distance) {
		this.vector.setFromMatrixColumn(this.camera.matrix, 0);
		this.camera.position.addScaledVector(this.vector, distance);
	}

	moveForward(distance) {
		this.vector.setFromMatrixColumn(this.camera.matrix, 0);
		this.vector.crossVectors(this.camera.up, this.vector);
		this.camera.position.addScaledVector(this.vector, distance);
	}

	// TODO fix
	moveUp(distance) {
		this.vector.setFromMatrixColumn(this.camera.matrix, 2);
		this.camera.position.addScaledVector(this.vector, distance);
	}

	lock() {
		this.domElement.requestPointerLock = this.domElement.requestPointerLock || this.domElement.mozRequestPointerLock || this.domElement.webkitRequestPointerLock;
		this.domElement.requestPointerLock();
	}

	unlock() {
		this.domElement.exitPointerLock = this.domElement.exitPointerLock || this.domElement.mozExitPointerLock || this.domElement.webkitExitPointerLock;
		this.domElement.exitPointerLock();
	}

	onPointerlockChange() {

	}

	onPointerlockError() {
		console.error("Unable to use pointer lock API");
	}

	addControlsEventListeners() {

		this.domElement.addEventListener("click", this.lock.bind(this));
		this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
		this.domElement.addEventListener("pointerlockchange", this.onPointerlockChange.bind(this));
		this.domElement.addEventListener("pointerlockerror", this.onPointerlockError.bind(this));

		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
	}

	removeControlEventListeners() {
		this.domElement.removeEventListener("click", this.lock.bind(this));
		this.domElement.removeEventListener("mousemove", this.onMouseMove.bind(this));
		this.domElement.removeEventListener("pointerlockchange", this.onPointerlockChange.bind(this));
		this.domElement.removeEventListener("pointerlockerror", this.onPointerlockError.bind(this));

		window.removeEventListener("keydown", this.onKeyDown.bind(this));
		window.removeEventListener("keyup", this.onKeyUp.bind(this));
	}
	enable() {
		if (!this.enabled) {
			log('Enabling player controls')
			this.enable = true;
			this.addControlsEventListeners();
		}
	}

	disable() {
		if (this.enabled) {
			// Unlocks pointer to this control file
			log('Disabling player controls')
			this.unlock();
			this.removeControlEventListeners();
			this.enabled = false;
		}
	}
	
}

export { PlayerControls };