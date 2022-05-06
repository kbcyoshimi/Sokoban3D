import { Canvas } from "./canvas";

export class MainCanvas extends Canvas{

	constructor (pixelRatio, start){
    	super('#mainCanvas', pixelRatio);
		this._camera = new THREE.PerspectiveCamera(45, this._canvas.clientWidth / this._canvas.clientHeight);
		this._camera.position.set(start[0] * 100, 0, start[1] * 100);
  	}
}