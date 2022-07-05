import * as THREE from "../modules/three.module.js";

//正方形の1辺の長さ
const SIDE = 100;

//1ラップの所要時間
const REQUIERD_TIME = 100;

//キー
const PROPERTYS = "propertys";
const VALUES = "values";

//アニメーションの種類と値
const MOVE = "move";

const TELEPORT = "teleport";

const PUSH = "push";
const PUSH_VALUE = 40;

const PULL = "pull";
const PULL_VALUE = -40;

const OPEN = "open";
const OPEN_VALUE = -101;

const CLOSE = "close";
const CLOSE_VALUE = 101;

const FALL = "fall";
const FALL_VALUE = -90;

//プロパティ名
const POSITION = "position";
const STATE = "state";
const STATE_UP = 2;
const STATE_DOWN = 1;
 
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
                        this._X_Z_Init(data, i, j);
                        break;
                    case PUSH :
                        this._switchInit(data, PUSH_VALUE);
                        break;
                    case PULL :
                        this._switchInit(data, PULL_VALUE);
                        break;
                    case OPEN :
                        this._doorInit(data, OPEN_VALUE);
                        break;
                    case CLOSE :
                        this._doorInit(data, CLOSE_VALUE);
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
    _X_Z_Init (data, i, j){
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

    _switchInit (data, value){
        data.position.x *= SIDE;
        data.position.z *= SIDE;

        data.group = this._tell.position(this._switchCodeCheck(data), true);

        data.distance = {"y" : value};
    }

    _doorInit (data, value){
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
                result = this._pushCalc(data);
                break;
            case PULL :
                result = this._pullCalc(data);
                break;
            case OPEN :
                result = this._openCalc(data, 0);
                break;
            case CLOSE :
                result = this._closeCalc(data, OPEN_VALUE);
                break;
            case FALL :
                result = this._fall_Calc(data);
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
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    _pushCalc (data){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY + data.group.y,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    _pullCalc (data){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY + data.group.y,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    _openCalc (data, correction){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY + correction,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    _closeCalc (data, correction){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY + correction,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    _fall_Calc (data){
        let progressY = data.distance.y * this._progressRate;

        let x = data.position.x,
            y = progressY,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
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
                result = this._pushLast(data);
                break;
            case PULL :
                result = this._pullLast(data);
                break;
            case OPEN :
                result = this._openLast(data, 0);
                break;
            case CLOSE :
                result = this._closeLast(data, OPEN_VALUE);
                break;
            case FALL :
                result = this._fall_Last(data);
                break;
            default :
        }

        return result;
    }

    _X_Z_Last (data){
        let x = data.destination.x,
            z = data.destination.z;

        let value = new THREE.Vector3(x, 0, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    _pushLast (data){
        let x = data.position.x,
            y = data.distance.y + data.group.y,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION, STATE],
            [VALUES] : [value, STATE_DOWN]
        }
    }

    _pullLast (data){
        let x = data.position.x,
            y = data.distance.y + data.group.y,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION, STATE],
            [VALUES] : [value, STATE_UP]
        }
    }

    _openLast (data, correction){
        let x = data.position.x,
            y = data.distance.y + correction,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION, STATE],
            [VALUES] : [value, STATE_DOWN]
        }
    }

    _closeLast (data, correction){
        let x = data.position.x,
            y = data.distance.y + correction,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION, STATE],
            [VALUES] : [value, STATE_UP]
        }
    }

    _fall_Last (data){
        let x = data.position.x,
            y = data.distance.y,
            z = data.position.z;

        let value = new THREE.Vector3(x, y, z);

        return {
            [PROPERTYS] : [POSITION],
            [VALUES] : [value]
        }
    }

    getLength (){
        return this._target.length;
    }
}