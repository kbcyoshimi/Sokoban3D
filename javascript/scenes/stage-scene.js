import * as THREE from "../modules/three.module.js";
import * as BufferGeometryUtils from "../modules/BufferGeometryUtils.js";
import { GLTFLoader } from "../modules/GLTFLoader";
import { Scene } from "./scene.js";
import { extract } from "../functions";

//正方形の1辺の長さ
const SIDE = 100;

//JSONデータやギミックのキー
const START = "start";
const MAP = "map";
const MAP_SIDE = "side";
const BACKGROUND = "background";
const YOU = "you";
const BOX = "box";
const BOXS = "boxs";
const FLOOR = "floor";
const GOAL = "goal";
const WALL = "wall";
const CONVEYOR = "conveyor";
const TELEPORT_ENTRY = "entry";
const TELEPORT_EXIT = "exit";
const HOLE = "hole";
const DOOR = "door";

//
const NUMBER = "number";
const BOOLEAN = "boolean";

//読み込みデータ用のキー
const MODEL = "model";
const TEXTURE = "texture";

//モデル読み込みデータ、テクスチャ読み込みデータ共に使用するキー
const URL = "url";
const FLAG = "flag";

//モデル読み込みデータで使用するキー
const NAME = "name";
const IS_MOVE = "isMove";
const OPTION = "option";
//オブジェクトのプロパティ名
const POSITION = "position";
const SCALE = "scale";
const ROTATION = "rotation";
const COLOR = "color";

//テクスチャ読み込みデータで使用するキー
const KEY = "key";
const INDEX = "index";
const IS_BG = "isBG";

//ステージのテクスチャのデフォルト
const BACKGROUND_DEFAULT = "sky";
const FLOOR_DEFAULT = "grass";
const GOAL_DEFAULT = "yellow";
const WALL_DEFAULT = "brick";
const CONVEYOR_DEFAULT = "normal";


//3Dモデルのurl
const MODEL_URLs = {
    [YOU] : "model/you.glb",
    [BOX] : "model/box.glb",
    [HOLE] : "model/hole.glb",
    [DOOR] : "model/door.glb"
}

//テクスチャのurl
const TEXTURE_URLs = {
    [BACKGROUND] : {
        "sky" : "img/backgrounds/sky.jpg",
        "forest" : "img/backgrounds/forest.jpg",
        "bleary_blue" : "img/backgrounds/bleary_blue.jpg"
    },
    [FLOOR] : {
        "grass" : "img/floors/grass.jpg"
    },
    [GOAL] : {
        "yellow" : "img/goals/yellow.jpg"
    },
    [WALL] : {
        "brick" : "img/walls/brick.jpg"
    },
    [CONVEYOR] : {
        "normal" : "img/conveyors/normal_conveyor.png"
    },
    [TELEPORT_ENTRY] : [
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
    [TELEPORT_EXIT] : [
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
const FLOOR_DATA = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": new THREE.MeshBasicMaterial()
}

//ゴールオブジェクトのデータ
const GOAL_RADIUS = 40;
const GOAL_TUBE = 5;
const GOAL_RADIAL_SEGMENTS = 2;
const GOAL_TUBULAR_SEGMENTS = 16;
const GOAL_DATA = {
    "geo": () => new THREE.TorusGeometry(GOAL_RADIUS, GOAL_TUBE, GOAL_RADIAL_SEGMENTS, GOAL_TUBULAR_SEGMENTS),
    "mat": new THREE.MeshBasicMaterial()
}

//壁オブジェクトのデータ
const WALL_DATA = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": new THREE.MeshBasicMaterial()
}

//屋根オブジェクトのデータ(トンネル用)
const ROOF_H = 5;
const TUNNEL_ROOF_DATA = {
    "geo": () => new THREE.BoxGeometry(SIDE, ROOF_H, SIDE),
    //使用マテリアルは壁と同一
    "mat": WALL_DATA.mat
}

//コンベアオブジェクトのデータ
const CONVEYOR_DIRECTION = [null, 180, 90, 0, 270];
const CONVEYOR_DATA = {
    "geo": () => new THREE.BoxGeometry(SIDE, SIDE, SIDE),
    "mat": new THREE.MeshBasicMaterial()
}

//サークルオブジェクトのデータ（テレポート用）
const CIRCLE_RADIUS = 50;
const CIRCLE_SEGMENTS = 32;
const CIRCLE_UP = 270;
const CIRCLE_ENTRY = 7;
const CIRCLE_EXIT = 8;
const CIRCLE_DATA = {
    "geo": () => new THREE.CircleGeometry(CIRCLE_RADIUS, CIRCLE_SEGMENTS),
    "mat": () => new THREE.MeshBasicMaterial()
}

//ドアオブジェクトのデータ
const DOOR_EW = 5;
const DOOR_SN = 6;
const DOOR_MAIN_MESH = "Merged_Objects";
const DOOR_COLOR = [
    null,
    0x326496,//青、赤、黄、緑、紫、オレンジ、ピンク、茶、黒
    0xff1818,
    0xfff200,
    0x0ed145,
    0xb83dba,
    0xff7f27,
    0xffaec8,
    0xb97a56,
    0x000000
];

//オブジェクトのスケール調整用データ
const YOU_SCALE = new THREE.Vector3(100, 90, 100);
const OTHER_SCALE = new THREE.Vector3(100, 100, 100);

//最上層(グリッドヘルパー用)と上層(プレイヤーオブジェクトと屋根用)のy座標
const TOP_LAYER = 999;
const UPPER_LAYER = 900;

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
        [MODEL] : [],
        [TEXTURE] : []
    };

    //移動、回転など、動かす必要のあるオブジェクトのデータ
    _moveObject = [];
    //動かすことのないオブジェクトのデータ
    _otherObject = [];
    //モデルを使用したオブジェクトの集合
    //動かすものと動かさないもので分類
    _modelObject = {
        "moveObject" : this._moveObject,
        "other" : this._otherObject
    }
    
    //ジオメトリをまとめるオブジェクトの集合
    //壁（トンネル）、床、コンベアが対象
    _groupGeometry = {
        [FLOOR] : [],
        [GOAL] : [],
        [WALL] : [],
        [CONVEYOR] : []
    }
    _teleportGeometry = {
        [TELEPORT_ENTRY] : [],
        [TELEPORT_EXIT] : []
    };

    //使用するテクスチャのマテリアル
    _useTextureMaterial = {
        [FLOOR] : FLOOR_DATA.mat,
        [GOAL] : GOAL_DATA.mat,
        [WALL] : WALL_DATA.mat,
        [CONVEYOR] : CONVEYOR_DATA.mat,
        [TELEPORT_ENTRY] : [],
        [TELEPORT_EXIT] : []
    }

    //背景テクスチャ
    _backgroundTextre = null;
    
    constructor (data){
        super("Stage");

        console.log(MODEL_URLs);

        //プレイヤーと荷物の情報を生成
        this._youModelDataCreate(data[START]);   
        for(let box of data[BOXS]) {
            this._boxModelDataCreate(box);
        }

        let existsConveyor = false;

        //マップデータを使用してオブジェクトの生成や読み込みを行う
        for(var z = 0; z < data[MAP].length; z++) {
            for(var x = 0; x < data[MAP][z].length; x++) {
                let id = data[MAP][z][x];
                switch(extract(id, 5)){
                    case FLOOR_N:
                        this._floorGenerate(x, z, id);
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
                        this._doorGenerate(x, z, id);
                        this._floorGenerate(x, z);
                        break;
                    default:
                        console.error("謎オブジェ");
                } 
            } 
        }
        
        this._ambientLightGenerate();
        this._gridHelperGenerate(data[MAP_SIDE]);

        //テクスチャ読み込み指定
        if (data[TEXTURE] === undefined){
            this._loadTextureDataCreate(BACKGROUND, BACKGROUND_DEFAULT);
            this._loadTextureDataCreate(FLOOR, FLOOR_DEFAULT);
            this._loadTextureDataCreate(GOAL, GOAL_DEFAULT);
            this._loadTextureDataCreate(WALL, WALL_DEFAULT);
            if (existsConveyor) this._loadTextureDataCreate(CONVEYOR, CONVEYOR_DEFAULT);
        }else {
            if (data[TEXTURE][BACKGROUND]) this._loadTextureDataCreate(BACKGROUND, data[TEXTURE][BACKGROUND]);
            if (data[TEXTURE][FLOOR]) this._loadTextureDataCreate(FLOOR, data[TEXTURE][FLOOR]);
            if (data[TEXTURE][GOAL]) this._loadTextureDataCreate(GOAL, data[TEXTURE][GOAL]);
            if (data[TEXTURE][WALL]) this._loadTextureDataCreate(WALL, data[TEXTURE][WALL]);
            if (existsConveyor && data[TEXTURE][CONVEYOR]) this._loadTextureDataCreate(CONVEYOR, data[TEXTURE][CONVEYOR]);
        }

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
    _floorGenerate (x, z, id){
        let floor = FLOOR_DATA.geo();
        floor.translate(x * SIDE, -SIDE, z * SIDE);
        this._groupGeometry[FLOOR].push(floor);

        //idがなければここまで
        if (!id) return;

        let index = extract(id, 2);
        if (index === 1){
            let goal = GOAL_DATA.geo();

            goal.rotateX(degToRad(CIRCLE_UP));

            let y = (-SIDE + SIDE / 2) + 1;
            goal.translate(x * SIDE, y, z * SIDE);
            this._groupGeometry[GOAL].push(goal);
        }
    }

    //壁のデータを作成し、保持する
    _wallGenerate (x, z){
        let wall = WALL_DATA.geo();
        wall.translate(x * SIDE, 0, z * SIDE);
        this._groupGeometry[WALL].push(wall);
    }

    //トンネルのデータを作成し、保持する
    _tunnelGenerate (x, z){
        let roof = TUNNEL_ROOF_DATA.geo(),
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
      
        this._groupGeometry[WALL].push(aboveRoof);
        this._groupGeometry[WALL].push(belowRoof);
    }

    //ベルトコンベアのデータを作成し、保持する
    _conveyorGenerate (x, z, id){
        let conveyor = CONVEYOR_DATA.geo();    
        //ベルトコンベアの向きを設定
        let index = extract(id, 3);
        conveyor.rotateY(degToRad(CONVEYOR_DIRECTION[index]));
        conveyor.translate(x * SIDE, -SIDE, z * SIDE);
        this._groupGeometry[CONVEYOR].push(conveyor);
    }

    //テレポートのデータを作成し、保持する
    _teleportGenerate (x, z, id){
        let teleport = CIRCLE_DATA.geo();
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

        let mat = CIRCLE_DATA.mat();

        //種類、番号に合わせてテクスチャの読み込みデータを作成する
        if (typeId === CIRCLE_ENTRY) {
            this._teleportGeometry[TELEPORT_ENTRY][index] = teleport;
            this._useTextureMaterial[TELEPORT_ENTRY][index] = mat;
            this._loadTextureDataCreate(TELEPORT_ENTRY, index);

        }else if (typeId === CIRCLE_EXIT) {
            this._teleportGeometry[TELEPORT_EXIT][index] = teleport;
            this._useTextureMaterial[TELEPORT_EXIT][index] = mat;
            this._loadTextureDataCreate(TELEPORT_EXIT, index);
        }
    }

    _switchGenerate (x, z){
        
    }

    _sensorGenerate (x, z){

    }

    //穴の読み込みデータを作成し、読み込みデータ配列に格納する
    _holeGenerate (x, z){
        let position = {"x" : x, "z" : z};
        this._loadModelDataCreate(HOLE, position, false);
    }

    //ドアの読み込みデータを作成し、読み込みデータ配列に格納する
    _doorGenerate (x, z, id){
        let position = {"x" : x, "z" : z};

        let index = extract(id, 3);
        let rotateY = -1;
        if (index === DOOR_EW) rotateY = 0;
        if (index === DOOR_SN) rotateY = degToRad(90);
        if (rotateY === -1) console.error("x : " + x + ", z : " + z + "のドアの数字がおかしい");

        index = extract(id, 1);
        let color = null;
        color = DOOR_COLOR[index];
        if (typeof(color) !== NUMBER) console.error("x : " + x + ", z : " + z + "のドアの数字がおかしい");

        this._doorModelDataCreate(position, rotateY, color);
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
        if (this._toggle[FLAG]){
            this._textureApply(FLOOR, this._toggle[FLOOR]);
            this._textureApply(WALL, this._toggle[WALL]);
        }else{
            this._textureApply(FLOOR, this._toggle[WALL]);
            this._textureApply(WALL, this._toggle[FLOOR]);
        }
        this._toggle[FLAG] = !this._toggle[FLAG];
    }

    //プレイヤーオブジェクトのモデル読み込みデータ作成
    _youModelDataCreate (position){
        let x = position.x * SIDE,
            y = UPPER_LAYER,
            z = position.z * SIDE;

        let vector = new THREE.Vector3(x, y, z);

        let scale = YOU_SCALE;

        let option = {
            [POSITION] : vector,
            [SCALE] : scale
        }

        this._loadModelDataCreate(YOU, true, option);
    }

    //箱オブジェクトのモデル読み込みデータ作成
    _boxModelDataCreate (position){
        let x = position.x * SIDE,
            z = position.z * SIDE;

        let vector = new THREE.Vector3(x, 0, z);

        let scale = OTHER_SCALE;

        let option = {
            [POSITION] : vector,
            [SCALE] : scale
        }

        this._loadModelDataCreate(BOX, true, option);
    }

    //穴オブジェクトのモデル読み込みデータ作成
    _holeModelDataCreate (position){
        let x = position.x * SIDE,
            y = -SIDE,
            z = position.z * SIDE;

        let vector = new THREE.Vector3(x, y, z);

        let scale = OTHER_SCALE;

        let option = {
            [POSITION] : vector,
            [SCALE] : scale
        }

        this._loadModelDataCreate(HOLE, false, option);
    }

    //ドアオブジェクトのモデル読み込みデータ作成
    _doorModelDataCreate (position, rotateY, colorCode){
        let x = position.x * SIDE,
            z = position.z * SIDE;

        let vector = new THREE.Vector3(x, 0, z);

        let scale = OTHER_SCALE;

        let rotation = new THREE.Euler(0, rotateY, 0);

        let color = new THREE.Color(colorCode);

        let option = {
            [POSITION] : vector,
            [SCALE] : scale,
            [ROTATION] : rotation,
            [COLOR] : color
        }

        this._loadModelDataCreate(DOOR, true, option);
    }

    //読み込むモデルデータの情報を作成し、保持する
    _loadModelDataCreate (name, isMove, option){

        if (!name) console.error("変数nameがおかしい");
        if (typeof(isMove) !== BOOLEAN) console.error("変数isMoveがおかしい");

        //読み込むデータの情報をモデルの配列にプッシュ
        this._loadData[MODEL].push({
            [NAME] : name,
            [URL] : MODEL_URLs[name],
            [OPTION] : option,
            [IS_MOVE] : isMove,       
            [FLAG] : false
        });
    }

    //読み込むテクスチャデータの情報を作成し、保持する
    _loadTextureDataCreate (key, key2){
        //読み込むデータの情報をテクスチャの配列にプッシュ
        typeof(key2) === NUMBER ?
        this._loadData[TEXTURE].push({
            [URL] : TEXTURE_URLs[key][key2],
            [KEY] : key,
            [INDEX] : key2,
            [FLAG] : false
        }):
        key === BACKGROUND ?
        this._loadData[TEXTURE].push({
            [URL] : TEXTURE_URLs[key][key2],
            [KEY] : key,
            [IS_BG] : true,
            [FLAG] : false
        }):
        this._loadData[TEXTURE].push({
            [URL] : TEXTURE_URLs[key][key2],
            [KEY] : key,
            [FLAG] : false
        });
    }

    //保持している読み込みデータをもとにデータを読み込む
    load (callback){
        //ローダーの宣言
        let modelLoader = new GLTFLoader(),
            textureLoader = new THREE.TextureLoader();

        let model = this._loadData[MODEL];

        //モデルデータの読み込み
        for(let i = 0; i < model.length; i++){
            modelLoader.load(model[i][URL], (gltf) => {
                //大きさや配置を反映
                let obj = gltf.scene;
                let option = model[i][OPTION];

                Object.keys(option).forEach(key => {
                    if (model[i][NAME] === DOOR && key === COLOR){
                        let mesh = obj.getObjectByName(DOOR_MAIN_MESH);
                        mesh.material.color = option[key];
                    }else {
                        obj[key].copy(option[key]);
                    }
                })

                model[i][IS_MOVE] ?
                this._moveObject[i] = obj:
                this._otherObject.push(obj);

                this._scene.add(obj);

                console.log(this._modelObject);
                //読み込み完了フラグを有効化
                model[i][FLAG] = true;
                this._loadComplete(callback);
            }, null, () => {
                console.log(i);
            });
        }

        let texture = this._loadData[TEXTURE];

        //テスト用(1)
        this._toggle = {
            [WALL] : null,
            [FLOOR] : null,
            [FLAG] : false
        };

        //テクスチャデータの読み込み
        for(let i = 0; i < texture.length; i++){
            textureLoader.load(texture[i][URL], (tex) => {
                //読み込んだテクスチャを適用
                texture[i][INDEX] ?
                this._textureApply(texture[i][KEY], tex, texture[i][INDEX]):
                texture[i][IS_BG] ?
                this._backgroundTextre = tex:
                this._textureApply(texture[i][KEY], tex);
                //読み込み完了フラグを有効化
                texture[i][FLAG] = true;
                this._loadComplete(callback);
                //テスト用(1)
                this._toggle[texture[i][KEY]] = tex;
            }, null, () => {
                console.log(i);
            });
        }
    }

    //モデルやテクスチャの読み込み完了を確認する
    _loadComplete (callback){
        let check = (val) => {
            return val[FLAG];
        }

        let model = this._loadData[MODEL].every(check);
        let texture = this._loadData[TEXTURE].every(check);

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
        let x = this._moveObject[code][POSITION].x,
            z = this._moveObject[code][POSITION].z;

        return {"x" : x, "z" : z};
    }

    get you (){
        return this._moveObject[0];
    }
}