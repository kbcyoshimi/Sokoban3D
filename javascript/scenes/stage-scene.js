import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";
import { Scene } from "./scene.js";
import { extract } from "../functions";

//正方形の1辺の長さ
const SIDE = 100;

//3Dモデルのurl
const MODEL_URLs = {
    "you" : "model/you.glb",
    "box" : "model/box.glb",
    "hole" : "model/hole.glb"
}

//テクスチャのurl
const TEXTURE_URLs = {
    "wall" : {
        "brick" : "img/brick.jpg"
    },
    "floor" : {
        "grass" : "img/grass.jpg"
    },
    "conveyor" : {
        "normal" : "img/conveyor.png"
    }
}

//マップのデータに対応した数値
const FLOOR_N = 1;
const WALL_N = 2;
const TUNNEL_N = 3;
const CONVEYOR_N = 4;
const TELEPORT_N = 5;
const SWITCH_N = 6;
const SENSOR_N = 7;
const HOLE_N = 8;
const DOOR_N = 9;

//ブロックオブジェクトのデータ(壁、床用)
const BLOCK = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": () => new THREE.MeshBasicMaterial()
}

//屋根オブジェクトのデータ(トンネル用)
const ROOF_H = 5;
const TUNNEL_ROOF = {
    "geo": () => new THREE.BoxGeometry(SIDE, ROOF_H, SIDE),
    "mat": () => new THREE.MeshBasicMaterial()    
}

const CONVEYOR_DIRECTION = [null, 180, 90, 0, 270];

//スフィアオブジェクトのデータ（テレポート用）
const SPHERE_RADIUS = 40;
const SPHERE_Y = 10;
const SPHERE = {
    "geo": () => new THREE.SphereGeometry(SPHERE_RADIUS),
    "mat": () => new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.7
    })
}

//プレイヤーオブジェクトの調整用データ
const YOU_SCALE = new THREE.Vector3(100, 90, 100);

//最上層(グリッドヘルパー用)と上層(プレイヤーオブジェクトと屋根用)のy座標
const TOP_LAYER = 999;
const UPPER_LAYER = 900;

//オブジェクトのプロパティ名
const POSITION = "position";

//度をラジアンに変換する関数
const degToRad = THREE.MathUtils.degToRad;

//
//https://pixnio.com/ja/%E9%A2%A8%E6%99%AF/%E5%9C%B0%E9%9D%A2/%E6%9A%97%E3%81%84%E3%80%81%E5%9C%B0%E9%9D%A2%E3%80%81%E3%83%86%E3%82%AF%E3%82%B9%E3%83%81%E3%83%A3%E3%80%81%E3%82%B5%E3%83%BC%E3%83%95%E3%82%A7%E3%82%B9%E3%80%81%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3

export class StageScene extends Scene{

    //読み込むデータの情報
    _loadData = {
        "model" : [],
        "texture" : []
    };

    //移動、回転など、動かす必要のあるオブジェクトのデータ
    //単体で使うことが多いので別に取っておく
    _moveObject = [];
    //モデルを使用したオブジェクトの集合
    //動かすものと動かさないもので分類
    _modelObject = {
        "moveObject" : this._moveObject,
        "other" : []
    }
    
    //テクスチャを使用したオブジェクトの集合
    //壁、床など、テクスチャの種類ごとに分類
    _useTextureObject = {
        "wall" : [],
        "floor" : [],
        "conveyor" : []
    }
    
    constructor (data){
        super("Stage");

        this._loadModelDataCreate("you", data.start, true, YOU_SCALE);   
        for(let box of data.boxs) {
            this._loadModelDataCreate("box", box);
        }

        //マップデータを使用してオブジェクトの生成や読み込みを行う
        for(var z = 0; z < data.map.length; z++) {
            for(var x = 0; x < data.map[z].length; x++) {
                let id = data.map[z][x];
                switch(extract(id, 5)){
                    case FLOOR_N:
                        this._floorGenerate(x, z);
                        break;
                    case WALL_N:
                        this._wallGenerate(x, z);
                        break;
                    case TUNNEL_N:
                        this._tunnelGenerate(x, z);
                        this._floorGenerate(x, z);
                        break;
                    case CONVEYOR_N:
                        this._conveyorGenerate(x, z, id);
                        break;
                    case TELEPORT_N:
                        this._teleportGenerate(x, z, id);
                        this._floorGenerate(x, z);
                        break;
                    case SWITCH_N:
                        break;
                    case SENSOR_N:
                        break;
                    case HOLE_N:
                        this._holeGenerate(x, z);
                        break;
                    case DOOR_N:
                        break;
                    default:
                        console.error("謎オブジェ");
                } 
            } 
        }
        
        this._ambientLightGenerate();
        this._gridHelperGenerate(data.side);

        //壁と床のテクスチャ読み込み指定(後でJSONのほうで指定する)
        this._loadTextureDataCreate("brick", "wall");
        this._loadTextureDataCreate("grass", "floor");
        this._loadTextureDataCreate("normal", "conveyor");
    }    
 
    //床のデータを作成し、保持する
    _floorGenerate (x, z){
        let floor = new THREE.Mesh(BLOCK.geo(), BLOCK.mat());
        floor.position.set(x * SIDE, -SIDE, z * SIDE);
        this._useTextureObject.floor.push(floor);
    }

    //壁のデータを作成し、保持する
    _wallGenerate (x, z){
        let wall = new THREE.Mesh(BLOCK.geo(), BLOCK.mat());
        wall.position.set(x * SIDE, 0, z * SIDE);
        this._useTextureObject.wall.push(wall);
    }

    //トンネルのデータを作成し、保持する
    _tunnelGenerate (x, z){
        let roof = new THREE.Mesh(TUNNEL_ROOF.geo(), TUNNEL_ROOF.mat()),
            aboveRoof = null,
            belowRoof = null;

        //y座標の定義
        let roofY = SIDE / 2 - ROOF_H / 2;
        let [above, below] = [UPPER_LAYER + roofY, roofY];

        roof.position.x = x * SIDE;
        roof.position.z = z * SIDE;

        //共通部分のコピー
        aboveRoof = roof.clone();
        belowRoof = roof.clone();

        //それぞれにy座標を代入
        aboveRoof.position.y = above;
        belowRoof.position.y = below
      
        this._useTextureObject.wall.push(aboveRoof);
        this._useTextureObject.wall.push(belowRoof);
    }

    //ベルトコンベアのデータを作成し、保持する
    _conveyorGenerate (x, z, id){
        let conveyor = new THREE.Mesh(BLOCK.geo(), BLOCK.mat());
        conveyor.position.set(x * SIDE, -SIDE, z * SIDE);
        let index = extract(id, 3);
        conveyor.rotation.y = degToRad(CONVEYOR_DIRECTION[index]);
        this._useTextureObject.conveyor.push(conveyor);
    }

    //テレポートのデータを作成し、保持する
    _teleportGenerate (x, z, id){
        let teleport = new THREE.Mesh(SPHERE.geo(), SPHERE.mat());
        teleport.position.set(x * SIDE, 0 - SPHERE_Y, z * SIDE);
        this._scene.add(teleport);
    }

    _switchGenerate (x, z){
        
    }

    _sensorGenerate (x, z){

    }

    _holeGenerate (x, z){
        let position = {"x" : x, "z" : z};
        this._loadModelDataCreate("hole", position, false);
    }

    _doorGenerate (x, z){

    }

    //壁や床にテクスチャを適用する
    _textureApply (key, tex){
        this._useTextureObject[key].map((val) => {
            this._scene.remove(val);
            val.material.setValues({map : tex});
            this._scene.add(val);
        });
    }

    //テスト用(1)
    textureToggle (){
        if (this._toggle.flag){
            this._textureApply("floor", this._toggle.floor);
            this._textureApply("wall", this._toggle.wall);
        }else{
            this._textureApply("floor", this._toggle.wall);
            this._textureApply("wall", this._toggle.floor);
        }
        this._toggle.flag = !this._toggle.flag;
    }

    //環境光源の生成
    _ambientLightGenerate (){
        let ambientLight = new THREE.AmbientLight(0xFFFFFF, 5);
        this._scene.add(ambientLight);
    }

    //グリッドヘルパーの生成
    _gridHelperGenerate (side){
        let gridHelper = new THREE.GridHelper(side * SIDE, side, 0xffffff, 0xffffff),
            aboveGridHelper = null,
            belowGridHelper = null;
        
        //y座標の定義
        let [above, below] = [TOP_LAYER, -SIDE / 2];

        //座標の計算
        let middle = side * SIDE / 2 - SIDE / 2;

        gridHelper.position.x = middle;
        gridHelper.position.z = middle;

        //共通部分のコピー
        aboveGridHelper = gridHelper.clone();
        belowGridHelper = gridHelper.clone();

        //それぞれにy座標を代入
        aboveGridHelper.position.y = above;
        belowGridHelper.position.y = below;

        this._scene.add(aboveGridHelper);
        this._scene.add(belowGridHelper);
    }

    //読み込むモデルデータの情報を作成し、保持する
    _loadModelDataCreate (name, position, isMove = true, scale = new THREE.Vector3(100, 100, 100)){
        //positionからVector3を作成
        let x = position.x * SIDE,
            z = position.z * SIDE;
        let vector = new THREE.Vector3(x, 0, z);

        if (name === "you") vector.y = UPPER_LAYER;
        if (name === "hole") vector.y = -SIDE;

        //読み込むデータの情報をモデルの配列にプッシュ
        this._loadData.model.push({
            "url" : MODEL_URLs[name],
            "position" : vector,
            "isMove" : isMove,
            "scale" : scale,
            "flag" : false
        });
    }

    //読み込むテクスチャデータの情報を作成し、保持する
    _loadTextureDataCreate (name, key){
        //読み込むデータの情報をテクスチャの配列にプッシュ
        this._loadData.texture.push({
            "url" : TEXTURE_URLs[key][name],
            "key" : key,
            "flag" : false
        })
    }

    //保持している読み込みデータをもとにデータを読み込む
    load (callback){
        //ローダーの宣言
        let modelLoader = new GLTFLoader(),
            textureLoader = new THREE.TextureLoader();

        let model = this._loadData.model;

        //モデルデータの読み込み
        for(let i = 0; i < model.length; i++){
            modelLoader.load(model[i].url, (gltf) => {
                //大きさや配置を反映
                let obj = gltf.scene;
                obj.scale.copy(model[i].scale);
                obj.position.copy(model[i].position);

                console.log(model[i].url, performance.now());
                model[i].isMove ?
                this._moveObject[i] = obj:
                this._modelObject.other.push(obj);

                this._scene.add(obj);

                console.log(this._modelObject);
                //読み込み完了フラグを有効化
                model[i].flag = true;
                this._loadComplete(callback);
            });
        }

        let texture = this._loadData.texture;

        //テスト用(1)
        this._toggle = {
            "wall" : null,
            "floor" : null,
            "flag" : false
        };

        //テクスチャデータの読み込み
        for(let i = 0; i < texture.length; i++){
            textureLoader.load(texture[i].url, (tex) => {
                //読み込んだテクスチャを適用
                this._textureApply(texture[i].key, tex);
                //読み込み完了フラグを有効化
                texture[i].flag = true;
                this._loadComplete(callback);
                //テスト用(1)
                this._toggle[texture[i].key] = tex;
            });
        }
    }

    //モデルやテクスチャの読み込み完了を確認する
    _loadComplete (callback){
        let check = (val) => {
            return val.flag;
        }

        let model = this._loadData.model.every(check);
        let texture = this._loadData.texture.every(check);

        if (model && texture) {
            callback();
        }
    }

    //対応するオブジェクトに受け取ったデータを適用する
    move (code, data){
        if (data === null) return;

        //キーと対応する値を取得する
        let propertys = data.propertys,
            values = data.values;
        
        //キーと値の数が一致しないときに警告
        if (propertys.length !== values.length) console.warn("キーと値の数が一致していません。");
        let length = Math.min(propertys.length, values.length);

        //キーに応じた代入方法で値を適用する
        for (let i = 0; i < length; i++){
            let property = propertys[i];
            switch (property){
                case POSITION:
                    this._moveObject[code][property].x = values[i].x;
                    this._moveObject[code][property].z = values[i].z;
                default:
            }
        }
    }

    getPosition (code){
        let x = this._moveObject[code].position.x,
            z = this._moveObject[code].position.z;

        return {"x" : x, "z" : z};
    }

    get you (){
        return this._moveObject[0];
    }
}