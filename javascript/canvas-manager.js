import { MainCanvas } from "./canvases/main-canvas";
import { ManualCanvas } from "./canvases/manual-Canvas";
import { MapCanvas } from "./canvases/map-canvas";
import { Game } from "./game";
import { StageScene } from "./scenes/stage-scene";
import { TitleScene } from "./scenes/title-scene";

export class CanvasManager{
    
    _world;
    _game;

    _main;
    _map;
    _manual;

    _stage;

    _animetionRequest = null;
    _waiting = false;
    _way;

    _test;

    constructor (){
        
        this._world = new TitleScene();

        this._main = new MainCanvas();
        this._map = new MapCanvas();
        this._manual = new ManualCanvas();

        this.tick();

        window.addEventListener("keydown", this._keydown.bind(this));
    }

    _keydown (event){
        if (this._waiting) return;
        switch (this._world.code) {
            case "Title" :
                console.log("title");
                this._titleKeydown(event);
                break;
            case "Stage" :
                console.log("stage");
                this._stageKeydown(event);
        }
    }

    _titleKeydown (event){
        this._getStageData("./stages/test.json");
    }

    _stageKeydown (event){
        switch (event.key) {
            case "ArrowLeft":
                this._turnMove("left");
                break;
            case "ArrowUp":
                this._turnMove("up");
                break;
            case "ArrowRight":
                this._turnMove("right");
                break;
            case "ArrowDown":
                this._turnMove("down");
                break;
            case " ":
                this._turnWait();
                break;
            case "r" :
                this._stageRestart();
                break;
            case "z" :
                this._turnBack();
                break;
            default:
                break;
        }
    }

    //ステージの初期処理
    _stageStart (){
        this._way = this._game.moveCheck();
        this._waiting = false;
    }

    _turnMove (direction){
        if (this._way[direction]["isPassing"]) {
            //仮コードここから
            this._test.start = this._way[direction]["position"];
            this._game = new Game(this._test);
            //仮コードここまで

            this._world.youMove(this._way[direction]["position"]["x"], this._way[direction]["position"]["z"]);
            this._turnEnd();
        }else {
            console.log("notice : Cannot move to the " + direction);
        }
    }

    _turnWait (){

    }

    _turnBack (){

    }

    _stageRestart (){

    }

    _turnEnd (){
        this._way = this._game.moveCheck();
    }

    _animetion (){
        if (this._animetionRequest === null) return;

    }

    //毎フレームごとに画面を更新する
    tick (){
        this._animetion();
        this._main.render(this._world.scene);
        this._map.render(this._world.scene);
        this._manual.render(this._world.scene);
        window.requestAnimationFrame(this.tick.bind(this));
    }

    //ステージを読み込む
    _getStageData (url){
        let data = null;
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = () => {
            data = JSON.parse(xhr.response);
            this._game = new Game(data);
            this._world = new StageScene(data, () => {
                this._stageStart();
            });

            this._test = data;
        }
        xhr.send();
        this._waiting = true;
    }
}