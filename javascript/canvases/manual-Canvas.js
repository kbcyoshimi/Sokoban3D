import { Canvas } from "./canvas";

export class ManualCanvas extends Canvas{

    constructor (pixelRatio){
        super('#manualCanvas', pixelRatio);
        this._camera = new THREE.PerspectiveCamera(45, this._canvas.clientWidth / this._canvas.clientHeight);
        this._camera.position.set(-1000, 0, -1000);
    }
}