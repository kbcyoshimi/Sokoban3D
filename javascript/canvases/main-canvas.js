import * as THREE from "../modules/three.module.js";
import { Canvas } from "./canvas";

export class MainCanvas extends Canvas{

	constructor (pixelRatio, start){
    	super('#mainCanvas', pixelRatio);
		this._camera = new THREE.PerspectiveCamera(45, this._canvas.clientWidth / this._canvas.clientHeight);
		this._camera.position.set(start.x * 100, 0, start.z * 100);
  	}
}