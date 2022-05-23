import * as THREE from "../modules/three.module.js"; 

export class Canvas{

    _pixelRatio = window.devicePixelRatio;

    _canvas;
    _renderer;
    _camera;

    constructor (selector){
        this._canvas = document.querySelector(selector);
    	this._renderer = new THREE.WebGLRenderer({
      		canvas: this._canvas
    	});
		this._renderer.setPixelRatio(this._pixelRatio);
		this._renderer.setSize(this._canvas.clientWidth, this._canvas.clientHeight);
    }

    setCamera (x, y, z){
        this._camera.position.set(x, y, z);
    }

    moveCamera (x, y, z){
        this._camera.position.x += x;
        this._camera.position.y += y;
        this._camera.position.z += z;
    }

    render (scene){
        this._renderer.render(scene, this._camera);
    }
}