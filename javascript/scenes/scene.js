import * as THREE from "../modules/three.module.js";

export class Scene{

    _code;
    _scene;

    constructor (code){
        this._code = code;
        this._scene = new THREE.Scene();
    }

    get code (){
        return this._code;
    }

    get scene (){
        return this._scene;
    }
}