import * as THREE from "../modules/three.module.js";

//正方形の1辺の長さ
const SIDE = 100;

//1ラップの所要時間
const REQUIERD_TIME = 100;

//アニメーションの種類とそれに応じたプロパティ名
const MOVE = "move";
const MOVE_PROPERTYS = ["position"];

const TELEPORT = "teleport";
const TELEPORT_PROPERTYS = ["position"];

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
                switch (data.key) {
                    case MOVE :
                    case TELEPORT :
                        this._moveInit(data, i, j);
                        break;
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
        data.position = this._tell(i);

        //移動距離の計算
        let x = data.destination.x - data.position.x;
        let z = data.destination.z - data.position.z;
        
        data.distance = {"x" : x, "z" : z};
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

    distanceCalc (i){
        if (!this._target[i].length) return null;

        let data = this._target[i][0];

        let result = null;

        switch (data.key){
            case MOVE :
            case TELEPORT :
                result = this._moveCalc(data);
                break;
            default :
        }

        return result;
    }

    _moveCalc (data){
        //アニメーション開始時から移動しておくべき距離
        let progressX = data.distance.x * this._progressRate,
            progressZ = data.distance.z * this._progressRate;

        //実際の座標を求める
        let x = progressX + data.position.x,
            z = progressZ + data.position.z;

        let value = new THREE.Vector3(x, 0, z);

        return {
            "propertys" : MOVE_PROPERTYS,
            "values" : [value]
        }
    }

    //ラップの最後の処理（ずれの調整など）
    wrapLast (i){
        if (!this._target[i].length) return null;

        let data = this._target[i][0];

        let result = null;

        switch (data.key){
            case MOVE :
            case TELEPORT :
                result = this._moveLast(data);
                break;
            default :
        }

        return result;
    }

    _moveLast(data) {
        let x = data.destination.x,
            z = data.destination.z;

        let value = new THREE.Vector3(x, 0, z);

        return {
            "propertys" : MOVE_PROPERTYS,
            "values" : [value]
        }
    }

    getLength (){
        return this._target.length;
    }
}