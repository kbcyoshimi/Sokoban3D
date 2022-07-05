import { Animation } from "./animetion/animetion";
import { MainCanvas } from "./canvases/main-canvas";
import { ManualCanvas } from "./canvases/manual-Canvas";
import { MapCanvas } from "./canvases/map-canvas";
import { Game } from "./game";
import { StageScene } from "./scenes/stage-scene";
import { TitleScene } from "./scenes/title-scene";

//正方形の1辺の長さ
const SIDE = 100;

const NUMBER = "number";

const KEY = "key";

const MOVE = "move";

const DESTINATION = "destination";

const POSITION = "position";

export class CanvasManager{
    
    _world;
    _game;

    _main;
    _map;
    _manual;

    _stage;

    _animetionRequest = null;
    _tell = null;
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

    //現在は直接ステージに飛ぶ
    _titleKeydown (event){
        this._getStageData("./stages/stage1.json");
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
                //テスト用(1)
                this._world.textureToggle();
                break;
            case "z" :
                this._turnBack();
                break;
            default:
                break;
        }
    }

    //ステージの初期処理
    _stageStart (data){

        this._main.startStageMode(data);
        this._map.startStageMode(data);
        this._manual.startStageMode(data);

        this._tell = this._world.tell;

        this._world.youNearCheck();

        this._way = this._game.moveCheck();
        this._waiting = false;
    }

    _turnMove (direction){
        if (this._way[direction]["isPassing"]) {

            let target = this._game.move(direction);
            target = JSON.parse(JSON.stringify(target));

            this._animetionRequest = new Animation(target, this._tell);
            this._animetionRequest.init();

            this._waiting = true;

            this._turnEnd();
        }else {
            console.log("notice : Cannot move to the " + direction);
        }
    }

    _turnWait (){

    }

    _turnBack (){
        let target = this._game.back();

        let newTarget = [];
        for (let i = 0; i < target.length; i++){
            if (typeof(target[i]) !== NUMBER){
                let last = target[i];
                let now = this._world.getPosition(i);
                let x = last.x * SIDE,
                    z = last.z * SIDE;

                if (x !== now.x || z !== now.z) newTarget[i] = [{[DESTINATION] : last, [KEY] : MOVE}];
                else newTarget[i] = [];
            } else{
                if (target[i] !== this._world.getState(i)){
                    let position = this._world.getPosition(i);
                    position.x /= SIDE;
                    position.z /= SIDE;

                    let order = this._world.getOrder(i, target[i]);
                    newTarget.push([
                        null,
                        {
                            [KEY] : order,
                            [POSITION] : position
                        }
                    ])
                }
            }
        }

        this._animetionRequest = new Animation(newTarget, this._tell);
        this._animetionRequest.init();

        this._waiting = true;
        
        this._turnEnd();
    }

    _stageRestart (){

    }

    _turnEnd (){
        this._way = this._game.moveCheck();
    }

    _animetion (){

        let req = this._animetionRequest;
        //アニメーション要求がなければreturn
        if (req === null) return;
        if (!req.isReady()) return;

        req.update();

        if (req.isWrapEnd()){
            for (let i = 0; i < req.getLength(); i++){
                let index = req.codeCheck(i);
                let data = req.wrapLast(i);
                this._world.move(index, data);
                if (index === 0 && data !== null) this._main.setCamera(data.values[0]);
            }
            if (req.isNext()){
                req.next();
            }else {
                this._animetionRequest = null;
                this._world.youNearCheck();
                this._waiting = false;
            }
        }else {
            for (let i = 0; i < req.getLength(); i++){
                let index = req.codeCheck(i);
                let data = req.distanceCalc(i);
                this._world.move(index, data);
                if (index === 0 && data !== null) this._main.setCamera(data.values[0]);
            }
        }
    }

    //視点と連動したyouオブジェクトの回転
    _rotation (){
        if (this._waiting) return;
        if (this._world.code !== "Stage") return;
        this._world.you.setRotationFromEuler(this._main.camera.rotation);
    }

    //毎フレームごとに画面を更新する
    tick (){
        this._animetion();
        this._rotation();
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
            this._world = new StageScene(data);
            this._world.load(() => {
                this._stageStart(data);
            });
        }
        xhr.send();
        this._waiting = true;
    }
}