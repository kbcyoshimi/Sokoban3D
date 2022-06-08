import * as THREE from "../modules/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";
import { Canvas } from "./canvas";

export class ManualCanvas extends Canvas{

    _controls;

    constructor (){
        super('#manualCanvas');
        this._camera = new THREE.PerspectiveCamera(90, this._canvas.clientWidth / this._canvas.clientHeight);
    }

    startStageMode (data){
        if(this._mode !== null) return;

        this._camera.position.set(0, 0, 0);

        this._controls = new OrbitControls(this._camera, this._canvas);
        this._controls.target.set(400, 0, 400);
        this._controls.update();

        super.startStageMode();
    }
}