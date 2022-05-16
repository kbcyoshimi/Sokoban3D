import { MainCanvas } from "./canvases/main-canvas";
import { ManualCanvas } from "./canvases/manual-Canvas";
import { MapCanvas } from "./canvases/map-canvas";
import { MapScene } from "./scenes/map-scene";

export class CanvasManager{

    _pixelRatio;
    _world;
    _main;
    _map;
    _manual;

    test = {
        "side":19,
        "start":[9, 15],
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

        this._world = new MapScene(this.test);

        this._main = new MainCanvas(this._pixelRatio, this.test.start);
        this._map = new MapCanvas(this._pixelRatio);
        this._manual = new ManualCanvas(this._pixelRatio);

        this.tick();
        document.addEventListener("keydown", this._keydown.bind(this));
    }

    _keydown (event){
        console.log(this);
        switch (event.key) {
            case "ArrowLeft":
                this._world.move(-1, 0);
                break;
            case "ArrowUp":
                this._world.move(0, -1);
                break;
            case "ArrowRight":
                this._world.move(1, 0);
                break;
            case "ArrowDown":
                this._world.move(0, 1);
                break;
            case " ":
                
                break;
            case "r" :

                break;
            case "z" :
            
                break;
            default:
                break;
        }
    }

    render (){
        this._main.render(this._world.scene);
        this._map.render(this._world.scene);
        this._manual.render(this._world.scene);
    }

    tick (){
        this._main.render(this._world.scene);
        this._map.render(this._world.scene);
        this._manual.render(this._world.scene);
        window.requestAnimationFrame(this.tick.bind(this));
    }
}