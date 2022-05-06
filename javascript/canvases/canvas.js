export class Canvas{

    _canvas;
    _renderer;
    _camera;

    constructor (selector, pixelRatio){
        this._canvas = document.querySelector(selector);
    	this._renderer = new THREE.WebGLRenderer({
      		canvas: this._canvas
    	});
		this._renderer.setPixelRatio(pixelRatio);
		this._renderer.setSize(this._canvas.clientWidth, this._canvas.clientHeight);
    }

    _render (scene){
        this._renderer.render(scene, this._camera);
    }
}