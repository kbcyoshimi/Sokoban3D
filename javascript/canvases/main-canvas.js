import * as THREE from "../modules/three.module.js";
import { Canvas } from "./canvas";

export class MainCanvas extends Canvas{

	constructor (start){
    	super('#mainCanvas');
		this._camera = new THREE.PerspectiveCamera(45, this._canvas.clientWidth / this._canvas.clientHeight);
		this._camera.position.set(4 * 100, 0, 3 * 100);
  	}
}