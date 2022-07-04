import * as THREE from "../modules/three.module.js";

//正方形の1辺の長さ
const SIDE = 100;

//1ラップの所要時間
const REQUIERD_TIME = 100;

//アニメーションの種類とプロパティ名
const MOVE = "move";

const TELEPORT = "teleport";

const PUSH = "push";
const PUSH_VALUE = -30;

const PULL = "pull";
const PULL_VALUE = 30;

const OPEN = "open";
const OPEN_VALUE = -101;

const CLOSE = "close";
const CLOSE_VALUE = 101;

const FALL = "fall";
const FALL_VALUE = -90;

const POSITION = "position"
 
export class Animation{

    //アニメーション開始時間
    _startTime = 0;
    //現在の時間
    _progressTime = 0;
    //進捗率
    _progressRate = 0;

    //要求されたアニメーションの情報
    _target = null;
    //不足情報を補うための関数
    _tell;

    //準備完了フラグ
    _ready = false;

    //値の代入と開始時間の設定を行う
    constructor (target, tell){
        this._startTime = performance.now();
        this._target = target;
        this._tell = tell;
    }

    //アニメーション要求の種類に応じた初期処理
    init (){
        for (let i = 0; i < this._target.length; i++){
            for (let j = 0; j < this._target[i].length; j++){
                let data = this._target[i][j];
                if (data === null) continue;
                switch (data.key) {
                    case MOVE :
                    case TELEPORT :
                        this._moveInit(data, i, j);
                        break;
                    case PUSH :
                        this._switchAndDoorInit(data, PUSH_VALUE);
                        break;
                    case PULL :
                        this._switchAndDoorInit(data, PULL_VALUE);
                        break;
                    case OPEN :
                        this._switchAndDoorInit(data, OPEN_VALUE);
                        break;
                    case CLOSE :
                        this._switchAndDoorInit(data, CLOSE_VALUE);
                        break;
                    case FALL :
                        this._fallInit(data, i, j);
                        break
                    default :
                }
            }
        }
        this._ready = true;
    }

    //移動前座標と移動先座標から移動距離を計算し、設定する
    _moveInit (data, i, j){
        //スケールをオブジェクトの大きさに合わせる
        data.destination.x *= SIDE;
        data.destination.z *= SIDE;

        //先頭でないデータのとき、１つ前のデータの移動先座標を移動前座標に設定し、
        //先頭のデータのとき、現在位置を問い合わせて移動前座標に設定する
        j ?
        data.position = this._target[i][j - 1].destination:
        data.position = this._tell.position(i);

        //移動距離の計算
        let x = data.destination.x - data.position.x;
        let z = data.destination.z - data.position.z;
        
        data.distance = {"x" : x, "z" : z};
    }

    _switchAndDoorInit (data, value){
        data.position.x *= SIDE;
        data.position.z *= SIDE;
        data.distance = {"y" : value};
    }

    _fallInit (data, i, j){
        data.position = this._target[i][j - 1].destination;

        data.distance = {"y" : FALL_VALUE};
    }

    //準備完了フラグを返す
    isReady (){
        return this._ready;
    }

    //現在の時間と進捗率を更新する
    update (){
        this._progressTime = performance.now() - this._startTime;
        this._progressRate = this._progressTime / REQUIERD_TIME;
    }

    //
    isNext (){
        let result = 0;
        for (let i = 0; i < this._target.length; i++){
            this._target[i].shift();
            result += this._target[i].length;
        }

        return result;
    }

    next (){
        this._startTime = performance.now();
    }

    isWrapEnd (){
        return this._progressTime >= REQUIERD_TIME;
    }

    codeCheck (i){
        if (!this._target[i].length) return null;

        let data = this._target[i][0];
        if (data === null) return null;

        let result = i;

        switch (data.key){
            case PUSH :
            case PULL :
                result = this._switchCodeCheck(data);
                break;
            case OPEN :
            case CLOSE :
                result = this._doorCodeCheck(data);
                break;
            default :
        }

        return result;
    }

    _switchCodeCheck (data){
        let code = this._tell.code(data.position, "switch");
        return code;
    }

    _doorCodeCheck (data){
        let code = this._tell.code(data.position, "door");
        return code;
    }

    distanceCalc (i){
        if (!this._target[i].length) return null;

        let data = this._target[i][0];
        if (data === null) return null;

        let result = null;

        switch (data.key){
            case MOVE :
            case TELEPORT :
                result = this._X_Z_Calc(data);
                break;
            case PUSH : 
            case PULL :
                break;
            case OPEN :
                result = this._Y_down_Calc(data);
                break;
            case CLOSE :
                result = this._Y_up_Calc(data, OPEN_VALUE);
                break;
            case FALL :
                result = this._Y_down_Calc(data);
                break
            default :
        }

        return result;
    }

    _X_Z_Calc (data){
        //アニメーション開始時から移動しておくべき距離
        let progressX = data.distance.x * this._progressRate,
            progressZ = data.distance.z * this._progressRate;

        //実際の座標を求める
        let x = progressX + data.position.x,
            z = progressZ + data.position.z;

        let value = new THREE.Vector3(x, 0, z);

        return {
            "propertys" : [POSITION],
            "values" : [value]
        }
    }

    _Y_up_Calc (data, correction){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY + correction,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            "propertys" : [POSITION],
            "values" : [value]
        }
    }

    _Y_down_Calc (data){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            "propertys" : [POSITION],
            "values" : [value]
        }
    }

    //ラップの最後の処理（ずれの調整など）
    wrapLast (i){
        if (!this._target[i].length) return null;

        let data = this._target[i][0];
        if (data === null) return null;

        let result = null;

        switch (data.key){
            case MOVE :
            case TELEPORT :
                result = this._X_Z_Last(data);
                break;
            case PUSH : 
            case PULL :
                break;
            case OPEN :
                result = this._Y_down_Last(data);
                break;
            case CLOSE :
                result = this._Y_up_Last(data, OPEN_VALUE);
                break;
            case FALL :
                result = this._Y_down_Last(data);
                break;
            default :
        }

        return result;
    }

    _X_Z_Last(data) {
        let x = data.destination.x,
            z = data.destination.z;

        let value = new THREE.Vector3(x, 0, z);

        return {
            "propertys" : [POSITION],
            "values" : [value]
        }
    }

    _Y_up_Last(data, correction) {
        let x = data.position.x,
            y = data.distance.y + correction,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            "propertys" : [POSITION],
            "values" : [value]
        }
    }

    _Y_down_Last(data) {
        let x = data.position.x,
            y = data.distance.y,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            "propertys" : [POSITION],
            "values" : [value]
        }
    }

    getLength (){
        return this._target.length;
    }
}