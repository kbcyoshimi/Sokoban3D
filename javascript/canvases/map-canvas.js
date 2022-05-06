import { Canvas } from "./canvas";

export class MapCanvas extends Canvas{
    
    constructor (pixelRatio){
        super('#mapCanvas', pixelRatio);
        this._camera = new THREE.OrthographicCamera(-100, +1900, +100, -1900);
        this._camera.position.set(0, +1000, 0);
        this._camera.rotation.x = -Math.PI/2;
    }
}