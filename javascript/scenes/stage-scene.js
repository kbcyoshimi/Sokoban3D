import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";
import { Scene } from "./scene.js";

//正方形の1辺の長さ
const SIDE = 100;

//3Dモデルのurl
const MODEL_URLs = {
    "you" : "model/you.glb",
    "box" : "model/box.glb"
}

//テクスチャのurl
const TEXTURE_URLs = {
    "wall" : {
        "brick" : "img/brick.jpg"
    },
    "floor" : {
        "grass" : "img/grass.jpg"
    }
}

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

//プレイヤーオブジェクトの調整用データ
const YOU_SCALE = new THREE.Vector3(100, 90, 100);

//最上層(グリッドヘルパー用)と上層(プレイヤーオブジェクトと屋根用)のy座標
const TOP_LAYER = 999;
const UPPER_LAYER = 900;

export class StageScene extends Scene{

    _loadData = {
        "model" : [],
        "texture" : []
    };

    _moveObject = [];

    _backgroundObject = {
        "wall" : [],
        "floor" : []
    }
    
    constructor (data){
        super("Stage");

        for(var z = 0; z < data.map.length; z++) {
            for(var x = 0; x < data.map[z].length; x++) {
                switch(Math.floor(data.map[z][x] / 10000)){
                    case 1:
                        this._floorGenerate(x * SIDE, z * SIDE);
                        break;
                    case 2:
                        this._wallGenerate(x * SIDE, z * SIDE);
                        break;
                    case 3:
                        this._tunnelGenerate(x * SIDE, z * SIDE);
                        this._floorGenerate(x * SIDE, z * SIDE);
                        break;
                    default:
                } 
            } 
        }
        
        this._ambientLightGenerate();
        this._gridHelperGenerate(data.side);

        this._loadModelDataCreate("you", data.start, YOU_SCALE);   
        for(let box of data.boxs) {
            this._loadModelDataCreate("box", box);
        }

        //壁と床のテクスチャ読み込み指定(後でJSONのほうで指定する)
        this._loadTextureDataCreate("brick", "wall");
        this._loadTextureDataCreate("grass", "floor");
    }    
 
    //床のデータを作成し、保持する
    _floorGenerate (x, z){
        let floor = new THREE.Mesh(BLOCK.geo(), BLOCK.mat());
        floor.position.set(x, -SIDE, z);
        this._backgroundObject.floor.push(floor);
    }

    //壁のデータを作成し、保持する
    _wallGenerate (x, z){
        let wall = new THREE.Mesh(BLOCK.geo(), BLOCK.mat());
        wall.position.set(x, 0, z);
        this._backgroundObject.wall.push(wall);
    }

    //トンネルのデータを作成し、保持する
    _tunnelGenerate (x, z){
        let roof = new THREE.Mesh(TUNNEL_ROOF.geo(), TUNNEL_ROOF.mat()),
            aboveRoof = null,
            belowRoof = null;

        //y座標の定義
        let roofY = SIDE / 2 - ROOF_H / 2;
        let [above, below] = [UPPER_LAYER + roofY, roofY];

        roof.position.x = x;
        roof.position.z = z;

        //共通部分のコピー
        aboveRoof = roof.clone();
        belowRoof = roof.clone();

        //それぞれにy座標を代入
        aboveRoof.position.y = above;
        belowRoof.position.y = below
      
        this._backgroundObject.wall.push(aboveRoof);
        this._backgroundObject.wall.push(belowRoof);
    }

    //壁や床にテクスチャを適用する
    _textureApply (key, tex){
        this._backgroundObject[key].map((val) => {
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
    _loadModelDataCreate (name, position, scale = new THREE.Vector3(100, 100, 100)){
        //positionからVector3を作成
        let x = position.x * SIDE,
            z = position.z * SIDE;
        let vector = new THREE.Vector3(x, 0, z);

        if (name === "you") vector.y = UPPER_LAYER;

        //読み込むデータの情報をモデルの配列にプッシュ
        this._loadData.model.push({
            "url" : MODEL_URLs[name],
            "position" : vector,
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
                this._moveObject[i] = gltf.scene;
                this._moveObject[i].scale.copy(model[i].scale);
                this._moveObject[i].position.copy(model[i].position);
                this._scene.add(this._moveObject[i]);

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

    move (code, direction, distance){

        let x = 0,
            z = 0;

        switch (direction){
            case "left" :
                x = -distance;
                break;
            case "up" :
                z = -distance;
                break;
            case "right" :
                x = distance;
                break;
            case "down" :
                z = distance;
                break;
            default:
                break;
        }

        this._moveObject[code].position.x += x;
        this._moveObject[code].position.z += z;
    }

    get you (){
        return this._moveObject[0];
    }
}