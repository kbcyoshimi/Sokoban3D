import * as THREE from "../modules/three.module.js";
import { Canvas } from "./canvas";

//正方形の1辺の長さ
const SIDE = 100;

export class MapCanvas extends Canvas{
    
    constructor (){
        super('#mapCanvas');
        this._camera = new THREE.PerspectiveCamera(60, this._canvas.clientWidth / this._canvas.clientHeight);
    }

    startStageMode (data){
        if(this._mode !== null) return;

        this._camera = new THREE.OrthographicCamera(-SIDE, +SIDE * data.side, +SIDE, -SIDE * data.side);
        this._camera.position.set(0, +1000, 0);
        this._camera.rotation.x = -Math.PI/2;

        super.startStageMode();
    }
}