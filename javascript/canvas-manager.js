import { MainCanvas } from "./canvases/main-canvas";
import { ManualCanvas } from "./canvases/manual-Canvas";
import { MapCanvas } from "./canvases/map-canvas";
import { MapScene } from "./scenes/map-scene";

export class CanvasManager{

    _pixelRatio;
    _scene;
    _main;
    _map;
    _manual;

    test = {
        "side":19,
        "s":[9, 15],
        "map":[ 
            [1,1,1,1,1,1,1,1], 
            [1,0,0,0,0,0,0,1], 
            [1,0,1,1,0,1,1,1], 
            [1,0,1,0,0,0,0,1], 
            [1,0,1,1,1,0,1,1], 
            [1,0,0,0,1,0,0,1], 
            [1,1,1,1,1,1,1,1] 
          ] 
    }

    constructor (){
        this._pixelRatio = window.devicePixelRatio;

        this._scene = new MapScene(this.test, this);

        this._main = new MainCanvas(this._pixelRatio, this.test.s);
        this._map = new MapCanvas(this._pixelRatio);
        this._manual = new ManualCanvas(this._pixelRatio);

        //this._tick();
    }

    render (){
        this._main._render(this._scene.scene);
        this._map._render(this._scene.scene);
        this._manual._render(this._scene.scene);
    }

    _tick (){
        
    }
}