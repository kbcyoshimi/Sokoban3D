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

    //現在は直接ステージに飛ぶ
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

            this._animetionRequest = {
                "startTime" : performance.now(),
                "distance" : this._world.squareSize,
                "totalTime" : 100,
                "target" : [
                    {
                        "code" : 0,
                        "progress" : 0,
                        "direction" : direction
                    }
                ]
            }

            this._waiting = true;

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
        //アニメーション要求がなければreturn
        if (this._animetionRequest === null) return;

        //経過時間をミリ秒で取得
        let timeProgress = performance.now() - this._animetionRequest.startTime;
        
        if (timeProgress >= this._animetionRequest.totalTime) {
            //アニメーション終了時の処理
            //誤差の修正
            for (let index in this._animetionRequest.target) {
                let measurementError = this._animetionRequest.distance - this._animetionRequest.target[index].progress;
                this._world.move(this._animetionRequest.target[index].code, this._animetionRequest.target[index].direction, measurementError);
                if (this._animetionRequest.target[index].code === 0) this._main.moveCamera(this._animetionRequest.target[index].direction, measurementError);
            }
            //要求の削除
            this._animetionRequest = null;
            //待ち状態の解除
            this._waiting = false;
        }else {
            //アニメーション処理
            //進捗を割合で取得
            let progress = timeProgress / this._animetionRequest.totalTime;
            //全ての対象オブジェクトにフレームごとの移動距離を計算し動かす
            for (let index in this._animetionRequest.target) {
                //進捗を移動距離に変換する
                let valueProgress = this._animetionRequest.distance * progress;
                let distance = valueProgress - this._animetionRequest.target[index].progress;
                this._animetionRequest.target[index].progress = valueProgress;
                this._world.move(this._animetionRequest.target[index].code, this._animetionRequest.target[index].direction, distance);
                if (this._animetionRequest.target[index].code === 0) this._main.moveCamera(this._animetionRequest.target[index].direction, distance); 
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
            this._world = new StageScene(data, () => {
                this._main.startStageMode(data);
                this._map.startStageMode(data);
                this._manual.startStageMode(data);
                this._stageStart();
            });

            this._test = data;
        }
        xhr.send();
        this._waiting = true;
    }
}