import * as THREE from "../modules/three.module.js";
import * as BufferGeometryUtils from "../modules/BufferGeometryUtils.js";
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
    "background" : {
        "sky" : "img/backgrounds/sky.jpg",
        "forest" : "img/backgrounds/forest.jpg",
        "bleary_blue" : "img/backgrounds/bleary_blue.jpg"
    },
    "wall" : {
        "brick" : "img/walls/brick.jpg"
    },
    "floor" : {
        "grass" : "img/floors/grass.jpg"
    },
    "conveyor" : {
        "normal" : "img/conveyors/normal_conveyor.png"
    },
    "entry" : [
        null,
        "img/teleports/teleport_entry_blue.png",
        "img/teleports/teleport_entry_red.png",
        "img/teleports/teleport_entry_yellow.png",
        "img/teleports/teleport_entry_green.png",
        "img/teleports/teleport_entry_violet.png",
        "img/teleports/teleport_entry_orange.png",
        "img/teleports/teleport_entry_pink.png",
        "img/teleports/teleport_entry_brown.png",
        "img/teleports/teleport_entry_black.png"
    ],
    "exit" : [
        null,
        "img/teleports/teleport_exit_blue.png",
        "img/teleports/teleport_exit_red.png",
        "img/teleports/teleport_exit_yellow.png",
        "img/teleports/teleport_exit_green.png",
        "img/teleports/teleport_exit_violet.png",
        "img/teleports/teleport_exit_orange.png",
        "img/teleports/teleport_exit_pink.png",
        "img/teleports/teleport_exit_brown.png",
        "img/teleports/teleport_exit_black.png"
    ]
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

//床オブジェクトのデータ
const FLOOR = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": new THREE.MeshBasicMaterial()
}

//壁オブジェクトのデータ
const WALL = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": new THREE.MeshBasicMaterial()
}

//屋根オブジェクトのデータ(トンネル用)
const ROOF_H = 5;
const TUNNEL_ROOF = {
    "geo": () => new THREE.BoxGeometry(SIDE, ROOF_H, SIDE),
    //使用マテリアルは壁と同一
    "mat": WALL.mat
}

//ベルトコンベアの向きを決定するための配列
const CONVEYOR_DIRECTION = [null, 180, 90, 0, 270];
const CONVEYOR = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": new THREE.MeshBasicMaterial()
}

//サークルオブジェクトのデータ（テレポート用）
const CIRCLE_RADIUS = 50;
const CIRCLE_SEGMENTS = 32;
const CIRCLE_UP = 270;
const CIRCLE_ENTRY = 7;
const CIRCLE_EXIT = 8;
const CIRCLE = {
    "geo": () => new THREE.CircleGeometry(CIRCLE_RADIUS, CIRCLE_SEGMENTS),
    "mat": () => new THREE.MeshBasicMaterial()
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

//土
//https://pixnio.com/ja/%E9%A2%A8%E6%99%AF/%E5%9C%B0%E9%9D%A2/%E6%9A%97%E3%81%84%E3%80%81%E5%9C%B0%E9%9D%A2%E3%80%81%E3%83%86%E3%82%AF%E3%82%B9%E3%83%81%E3%83%A3%E3%80%81%E3%82%B5%E3%83%BC%E3%83%95%E3%82%A7%E3%82%B9%E3%80%81%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3
//魔法陣
//https://illust8.com/contents/5539
//https://www.beiz.jp/

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
    
    //ジオメトリをまとめるオブジェクトの集合
    //壁（トンネル）、床、コンベアが対象
    _groupGeometry = {
        "floor" : [],
        "wall" : [],
        "conveyor" : []
    }
    _teleportGeometry = {
        "entry" : [],
        "exit" : []
    };

    //使用するテクスチャのマテリアル
    _useTextureMaterial = {
        "floor" : FLOOR.mat,
        "wall" : WALL.mat,
        "conveyor" : CONVEYOR.mat,
        "entry" : [],
        "exit" : []
    }

    //背景テクスチャ
    _backgroundTextre = null;
    
    constructor (data){
        super("Stage");

        //プレイヤーと荷物の情報を生成
        this._loadModelDataCreate("you", data.start, true, YOU_SCALE);   
        for(let box of data.boxs) {
            this._loadModelDataCreate("box", box);
        }

        let existsConveyor = false;

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
                        existsConveyor = true;
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

        //テクスチャ読み込み指定
        let jsonTextureError = false;
        if (data.texture === undefined) jsonTextureError = true;

        !jsonTextureError && data.texture.background ? 
        this._loadTextureDataCreate("background", data.texture.background):
        jsonTextureError = true;

        !jsonTextureError && data.texture.floor ? 
        this._loadTextureDataCreate("floor", data.texture.floor):
        jsonTextureError = true;

        !jsonTextureError && data.texture.wall ?
        this._loadTextureDataCreate("wall", data.texture.wall):
        jsonTextureError = true;
        
        if (!jsonTextureError && existsConveyor && data.texture.conveyor) this._loadTextureDataCreate("conveyor", data.texture.conveyor)

        if (jsonTextureError) console.error("JSONのテクスチャ情報にエラーがあります");
        //テクスチャ情報
        //背景：必須
        //床：必須    
        //壁：必須
        //ベルトコンベア：ステージに存在する場合は必須
        //テレポート：内部で設定するため指定不要
        //その他：未作成、もしくは指定不要
        //使用可能なテクスチャは定数TEXTURE_URLsを参照

        //例
        //"texture" : {
        //    "background" : "sky",
        //    "floor" : "grass",
        //    "wall" : "brick",
        //    "conveyor" : "normal"
        // }
    }    
 
    //床のデータを作成し、保持する
    _floorGenerate (x, z){
        let floor = FLOOR.geo();
        floor.translate(x * SIDE, -SIDE, z * SIDE);
        this._groupGeometry.floor.push(floor);
    }

    //壁のデータを作成し、保持する
    _wallGenerate (x, z){
        let wall = WALL.geo();
        wall.translate(x * SIDE, 0, z * SIDE);
        this._groupGeometry.wall.push(wall);
    }

    //トンネルのデータを作成し、保持する
    _tunnelGenerate (x, z){
        let roof = TUNNEL_ROOF.geo(),
            aboveRoof = null,
            belowRoof = null;

        //y座標の定義
        let roofY = SIDE / 2 - ROOF_H / 2;
        let [above, below] = [UPPER_LAYER + roofY, roofY];

        x *= SIDE;
        z *= SIDE; 

        aboveRoof = roof.clone();
        belowRoof = roof.clone();

        aboveRoof.translate(x, above, z);
        belowRoof.translate(x, below, z);
      
        this._groupGeometry.wall.push(aboveRoof);
        this._groupGeometry.wall.push(belowRoof);
    }

    //ベルトコンベアのデータを作成し、保持する
    _conveyorGenerate (x, z, id){
        let conveyor = CONVEYOR.geo();    
        //ベルトコンベアの向きを設定
        let index = extract(id, 3);
        conveyor.rotateY(degToRad(CONVEYOR_DIRECTION[index]));
        conveyor.translate(x * SIDE, -SIDE, z * SIDE);
        this._groupGeometry.conveyor.push(conveyor);
    }

    //テレポートのデータを作成し、保持する
    _teleportGenerate (x, z, id){
        let teleport = CIRCLE.geo();
        //テレポートの面を上向きに設定
        teleport.rotateX(degToRad(CIRCLE_UP));
        
        //y座標を設定
        let y = (-SIDE + SIDE / 2) + 1;
        teleport.translate(x * SIDE, y, z * SIDE);

        //テレポートの種類を表す（入口、出口）
        let typeId = extract(id, 3);
        //テレポートの番号を表す
        let index = extract(id, 1);
        if (!(typeId === CIRCLE_ENTRY || typeId === CIRCLE_EXIT)) console.error("x : " + x + ", z : " + z + "のテレポートの数字がおかしい");

        let mat = CIRCLE.mat();

        //種類、番号に合わせてテクスチャの読み込みデータを作成する
        if (typeId === CIRCLE_ENTRY) {
            this._teleportGeometry.entry[index] = teleport;
            this._useTextureMaterial.entry[index] = mat;
            this._loadTextureDataCreate("entry", index);

        }else if (typeId === CIRCLE_EXIT) {
            this._teleportGeometry.exit[index] = teleport;
            this._useTextureMaterial.exit[index] = mat;
            this._loadTextureDataCreate("exit", index);
        }
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

    //壁や床にテクスチャを適用する
    _textureApply (key, tex, index = 0){
        //インデックスの有無で深さを判断
        index ?
        this._useTextureMaterial[key][index].setValues({map : tex}):
        this._useTextureMaterial[key].setValues({map : tex});
    }

    //保持したオブジェクトをシーンに追加する
    _addScene (){
        //ジオメトリを一つにまとめるオブジェクトのシーン追加
        let map = this._groupGeometry;
        Object.keys(map).forEach(key => {
            let boxes = [];
            //複数のジオメトリを配列に設定
            for (let geo of map[key]){
                boxes.push(geo);
            }

            if (!boxes.length) return;

            //ジオメトリの配列から一つのジオメトリを作成する
            let geos = BufferGeometryUtils.mergeBufferGeometries(boxes);
            let mat = this._useTextureMaterial[key];
            let mesh = new THREE.Mesh(geos, mat);
            this.scene.add(mesh);
        })

        //テレポートのシーン追加
        let mapTele = this._teleportGeometry;
        Object.keys(mapTele).forEach(key => {
            for (let i = 0; i < mapTele[key].length; i++){
                let geo = mapTele[key][i];
                if (!geo) continue;
                let mat = this._useTextureMaterial[key][i];
                let mesh = new THREE.Mesh(geo, mat);
                this._scene.add(mesh);
            }
        })

        //背景の適用
        this._scene.background = this._backgroundTextre;
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
    _loadTextureDataCreate (key, key2){
        //読み込むデータの情報をテクスチャの配列にプッシュ
        typeof(key2) === "number" ?
        this._loadData.texture.push({
            "url" : TEXTURE_URLs[key][key2],
            "key" : key,
            "index" : key2,
            "flag" : false
        }):
        key === "background" ?
        this._loadData.texture.push({
            "url" : TEXTURE_URLs[key][key2],
            "key" : key,
            "isBG" : true,
            "flag" : false
        }):
        this._loadData.texture.push({
            "url" : TEXTURE_URLs[key][key2],
            "key" : key,
            "flag" : false
        });
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
                texture[i].index ?
                this._textureApply(texture[i].key, tex, texture[i].index):
                texture[i].isBG ?
                this._backgroundTextre = tex:
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
            this._addScene();
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
                case POSITION :
                    if (code === 0){
                        this._moveObject[code][POSITION].x = values[i].x;
                        this._moveObject[code][POSITION].z = values[i].z;
                    }else {
                        this._moveObject[code][POSITION].copy(values[i]);
                    }
                    break;
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