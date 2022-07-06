import { Animation } from "./animetion/animetion";
import { MainCanvas } from "./canvases/main-canvas";
import { ManualCanvas } from "./canvases/manual-Canvas";
import { MapCanvas } from "./canvases/map-canvas";
import { Game } from "./game";
import { StageScene } from "./scenes/stage-scene";
import { TitleScene } from "./scenes/title-scene";

//正方形の1辺の長さ
const SIDE = 100;

const INFO = "#info";

const NUMBER = "number";

const KEY = "key";

const MOVE = "move";

const DESTINATION = "destination";

const POSITION = "position";

const STATE_INIT = 2;

const STAGE_INIT = 1;
const STAGE_URL_LEFT = "./stages/stage";
const STAGE_URL_RIGHT = ".json";

export class CanvasManager{
    
    _world;
    _game;

    _info;
    _clearMessage;

    _main;
    _map;
    _manual;

    _stage = STAGE_INIT;

    _animetionRequest = null;
    _tell = null;
    _waiting = false;
    _way;

    constructor (){
        
        this._world = new TitleScene();

        this._info = document.querySelector(INFO);
        this._clearMessageInit();

        this._main = new MainCanvas();
        this._map = new MapCanvas();
        this._manual = new ManualCanvas();

        this.tick();

        window.addEventListener("keydown", this._keydown.bind(this));
    }

    _clearMessageInit (){
        let infoContainerDiv = document.createElement("div");
        infoContainerDiv.setAttribute("id", "infoContainer");

        let messageP = document.createElement("p");
        messageP.setAttribute("id", "message");
        messageP.textContent = "ステージ クリア！";

        let nextDiv = document.createElement("div");
        nextDiv.setAttribute("id", "next");
        nextDiv.setAttribute("class", "selectArea");

        let selectTextP1 = document.createElement("p");
        selectTextP1.setAttribute("class", "selectText");
        selectTextP1.textContent = "次のステージへ";

        nextDiv.appendChild(selectTextP1);
        nextDiv.addEventListener("click", this._stageEnd.bind({"manager" : this, "opinion" : "next"}));

        let exitDiv = document.createElement("div");
        exitDiv.setAttribute("id", "exit");
        exitDiv.setAttribute("class", "selectArea");

        let selectTextP2 = document.createElement("p");
        selectTextP2.setAttribute("class", "selectText");
        selectTextP2.textContent = "終了";

        exitDiv.appendChild(selectTextP2);
        exitDiv.addEventListener("click", this._stageEnd.bind({"manager" : this, "opinion" : "exit"}));

        infoContainerDiv.appendChild(messageP);
        infoContainerDiv.appendChild(nextDiv);
        infoContainerDiv.appendChild(exitDiv);

        this._clearMessage = infoContainerDiv;
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
        this._getStageData(STAGE_URL_LEFT + this._stage + STAGE_URL_RIGHT);
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
            case "p" :
                this._infoDisplay(this._clearMessage);
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
            console.log(JSON.parse(JSON.stringify(target)));

            this._animetionRequest = new Animation(target, this._tell);
            this._animetionRequest.init();

            this._waiting = true;
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
                        {[KEY] : order,[POSITION] : position}
                    ])
                }
            }
        }

        this._animetionRequest = new Animation(newTarget, this._tell);
        this._animetionRequest.init();

        this._waiting = true;
    }

    _stageRestart (){
        let data = this._game.orgData;

        this._game = new Game(data);

        let target = [];

        target.push([{[DESTINATION] : data.start, [KEY] : MOVE}]);
        for (let box of data.boxs){
            target.push([{[DESTINATION] : box, [KEY] : MOVE}]);
        }

        let length = this._world.moveObjectLength;
        for (let i = 0; i < length; i++){
            let state = this._world.getState(i);
            if (state && state !== STATE_INIT){
                let position = this._world.getPosition(i);
                position.x /= SIDE;
                position.z /= SIDE;

                let order = this._world.getOrder(i, STATE_INIT);
                target.push([
                    null,
                    {[KEY] : order,[POSITION] : position}
                ])
            }
        }

        this._animetionRequest = new Animation(target, this._tell, data.dir);
        this._animetionRequest.init();

        this._waiting = true;
    }

    _turnEnd (direction){
        if (this._game.goalCheck()){
            this._infoDisplay(this._clearMessage);
        }else {
            this._way = this._game.moveCheck();
            this._main.setDirection(direction);
            this._world.youNearCheck();
            this._waiting = false;
        }
    }

    _stageEnd (){
        console.log("end", this);
        this.manager._infoDisplayClean();
        this.manager._main.endStageMode();
        this.manager._map.endStageMode();
        this.manager._manual.endStageMode();

        switch (this.opinion){
            case "next" :
                this.manager._nextStage();
                break;
            case "exit" :
                this.manager._stageExit();
                break;
            default:
        }

    }

    _nextStage (){
        this._stage++;
        this._getStageData(STAGE_URL_LEFT + this._stage + STAGE_URL_RIGHT);
    }

    _stageExit (){
        this._stage = STAGE_INIT;
        this._world = new TitleScene();
        console.log(this._waiting);
        this._waiting = false;
    }
    

    _infoDisplay (document){
        this._info.appendChild(document);
        this._info.style.visibility = "visible";
    }

    _infoDisplayClean (){
        this._info.style.visibility = "hidden";
        while(this._info.firstChild){
            this._info.removeChild(this._info.firstChild);
        }
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
                this._turnEnd(req.direction);
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