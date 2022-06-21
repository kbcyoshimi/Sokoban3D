import * as THREE from "../modules/three.module.js"; 

export class Canvas{

    _pixelRatio = window.devicePixelRatio;

    _canvas;
    _renderer;
    _camera;

    _mode = null;

    constructor (selector){
        this._canvas = document.querySelector(selector);
    	this._renderer = new THREE.WebGLRenderer({
      		canvas: this._canvas
    	});
		this._renderer.setPixelRatio(this._pixelRatio);
		this._renderer.setSize(this._canvas.clientWidth, this._canvas.clientHeight);
    }

    setCamera (vector){
        this._camera.position.copy(vector);
    }

    moveCamera(direction, distance){

        let x = 0;
        let z = 0;

        switch (direction){
            case "left" :
                x = -distance;
                break;
            case "up" :
                z = -distance;
                break;
            case "right" :
                x = distance;
                break;
            case "down" :
                z = distance;
                break;
            default:
                break;
        }
        
        this._camera.position.x += x;
        this._camera.position.z += z;

        return {
            "x" : x,
            "z" : z,
        };
    }

    startStageMode (){
        this._mode = "Stage";
    }

    endStageMode (){
        this._mode = null;
    }

    render (scene){
        this._renderer.render(scene, this._camera);
    }

    get camera (){
        return this._camera;
    }
}