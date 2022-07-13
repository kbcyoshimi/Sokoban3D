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
const STAGE_FINAL = 48; 
const STAGE_URL_LEFT = "./stages/stage";
const STAGE_URL_RIGHT = ".json";

//15,(3,17),(5,18),(24,25)

export class CanvasManager{
    
    _world;
    _game;

    _info;
    _titleMessage;
    _clearMessage;
    _pauseMessage;
    _completeMessage;

    _main;
    _map;
    _manual;

    _stage = STAGE_INIT;
    _turn = 0;

    _animetionRequest = null;
    _tell = null;
    _waiting = false;
    _way;

    constructor (){
        
        this._world = new TitleScene();

        this._info = document.querySelector(INFO);
        this._titleMessageInit();
        this._clearMessageInit();
        this._pauseMessageInit();
        this._completeMessageInit();

        this._infoDisplay(this._titleMessage);

        this._main = new MainCanvas();
        this._map = new MapCanvas();
        this._manual = new ManualCanvas();

        this.tick();

        window.addEventListener("keydown", this._keydown.bind(this));
    }

    _titleMessageInit (){
        let infoContainerDiv = document.createElement("div");
        infoContainerDiv.setAttribute("id", "infoContainer");

        let titleDiv = document.createElement("div");
        titleDiv.setAttribute("id", "title");
        
        let titleLine1 = document.createElement("div");
        titleLine1.setAttribute("id", "titleLine1");

        let titleLine2 = document.createElement("div");
        titleLine2.setAttribute("id", "titleLine2");

        let parts1 = document.createElement("p"),
            parts2 = document.createElement("p"),
            parts3 = document.createElement("p"),
            parts4 = document.createElement("p"),
            parts5 = document.createElement("p"),
            parts6 = document.createElement("p"),
            parts7 = document.createElement("p"),
            parts8 = document.createElement("p");

        parts1.setAttribute("id", "parts1");
        parts2.setAttribute("id", "parts2");
        parts3.setAttribute("id", "parts3");
        parts4.setAttribute("id", "parts4");
        parts5.setAttribute("id", "parts5");
        parts6.setAttribute("id", "parts6");
        parts7.setAttribute("id", "parts7");
        parts8.setAttribute("id", "parts8");

        parts1.textContent = "S";
        parts2.textContent = "O";
        parts3.textContent = "K";
        parts4.textContent = "O";
        parts5.textContent = "B";
        parts6.textContent = "A";
        parts7.textContent = "N";
        parts8.textContent = "3D";

        titleLine1.appendChild(parts1);
        titleLine1.appendChild(parts2);
        titleLine1.appendChild(parts3);
        titleLine1.appendChild(parts4);
        titleLine1.appendChild(parts5);
        titleLine1.appendChild(parts6);
        titleLine1.appendChild(parts7);

        titleLine2.appendChild(parts8);

        titleDiv.appendChild(titleLine1);
        titleDiv.appendChild(titleLine2);

        infoContainerDiv.appendChild(titleDiv);

        this._titleMessage = infoContainerDiv;
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

    _pauseMessageInit (){
        let infoContainerDiv = document.createElement("div");
        infoContainerDiv.setAttribute("id", "infoContainer");

        let messageP = document.createElement("p");
        messageP.setAttribute("id", "message");
        messageP.textContent = "ポーズ";

        let nextDiv = document.createElement("div");
        nextDiv.setAttribute("id", "next");
        nextDiv.setAttribute("class", "selectArea");

        let selectTextP1 = document.createElement("p");
        selectTextP1.setAttribute("class", "selectText");
        selectTextP1.textContent = "続ける";

        nextDiv.appendChild(selectTextP1);
        nextDiv.addEventListener("click", this._pauseEnd.bind(this));

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

        this._pauseMessage = infoContainerDiv;
    }

    _completeMessageInit (){
        let infoContainerDiv = document.createElement("div");
        infoContainerDiv.setAttribute("id", "infoContainer");

        let messageP = document.createElement("p");
        messageP.setAttribute("id", "message");
        messageP.textContent = "ステージ オールクリア！";

        let exitDiv = document.createElement("div");
        exitDiv.setAttribute("id", "exit");
        exitDiv.setAttribute("class", "selectArea center");

        let selectTextP = document.createElement("p");
        selectTextP.setAttribute("class", "selectText");
        selectTextP.textContent = "終了";

        exitDiv.appendChild(selectTextP);
        exitDiv.addEventListener("click", this._stageExit.bind(this));

        infoContainerDiv.appendChild(messageP);
        infoContainerDiv.appendChild(exitDiv);

        this._completeMessage = infoContainerDiv;
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
        let isRunning = document.getAnimations().some(val => {
            return val.playState === "running";
        });

        if (isRunning){
            document.getAnimations().forEach(val => {
                val.finish();
            });
        } else{
            this._infoDisplayClean();
            this._getStageData(STAGE_URL_LEFT + this._stage + STAGE_URL_RIGHT);
        }
    }

    _stageKeydown (event){
        let direction;
        switch (event.key) {    
            case "ArrowLeft":
                this._main.turnLeft();
                break;
            case "ArrowUp":
                direction = this._main.getDirection();
                this._turnMove(direction);
                break;
            case "ArrowRight":
                this._main.turnRight();
                break;
            case "ArrowDown":
                direction = this._main.getDirectionReverse();
                this._turnMove(direction);
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
                this._pause();
                break;
            case "c" :
                if (event.ctrlKey && event.altKey) this._infoDisplay(this._clearMessage);
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

        let manual = this._manual.TextForMesh("ステージ" + this._stage + " " + "移動数 : " + this._turn);
        this._world.initManual(manual);

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

            //仮コード
            this._turn++
        }else {
            console.log("notice : Cannot move to the " + direction);
        }
    }

    _turnWait (){
        let target = this._game.wait();

        this._animetionRequest = new Animation(target, this._tell);
        this._animetionRequest.init();

        this._waiting = true;

        //仮コード
        this._turn++
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
                        {[KEY] : order, [POSITION] : position}
                    ])
                }
            }
        }

        this._animetionRequest = new Animation(newTarget, this._tell);
        this._animetionRequest.init();

        this._waiting = true;

        //仮コード
        this._turn--
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

        //仮コード
        this._turn = 0;
    }

    _pause (){
        this._waiting = true;
        this._infoDisplay(this._pauseMessage);
    }

    _pauseEnd (){
        this._infoDisplayClean();
        this._waiting = false;
    }

    _turnEnd (direction){
        let manual = this._manual.TextForTexture("ステージ" + this._stage + " " + "移動数 : " + this._turn);
        this._world.updateManual(manual);

        if (this._game.goalCheck()){
            this._stage++;
            if (this._stage > STAGE_FINAL) this._infoDisplay(this._completeMessage);
            else this._infoDisplay(this._clearMessage);
        }else {
            this._way = this._game.moveCheck();
            this._main.setDirection(direction);
            this._world.youNearCheck();
            this._waiting = false;
        }
    }

    _stageEnd (){
        this.manager._main.endStageMode();
        this.manager._map.endStageMode();
        this.manager._manual.endStageMode();
        this.manager._turn = 0;

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
        this._infoDisplayClean();
        this._getStageData(STAGE_URL_LEFT + this._stage + STAGE_URL_RIGHT);
    }

    _stageExit (){
        this._stage = STAGE_INIT;
        this._world = new TitleScene();
        this._infoDisplay(this._titleMessage);
        this._waiting = false;
    }

    _infoDisplay (document){
        this._infoDisplayClean();
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
                if (index !== null && index[0] === 0 && data !== null) this._main.setCamera(data[0].values[0]);
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
                if (index !== null && index[0] === 0 && data !== null) this._main.setCamera(data[0].values[0]);
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