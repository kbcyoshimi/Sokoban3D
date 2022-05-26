import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";
import { Scene } from "./scene.js";

export class StageScene extends Scene{

    _urls = {
        "you" : "model/you.glb",
        "box" : "model/box.glb"
    }
    _loadData = [];

    _squareSize = 100;

    _wallData = {
        "geometry": new THREE.BoxGeometry(this._squareSize, this._squareSize, this._squareSize),
        "material": new THREE.MeshNormalMaterial()
    };

    _moveObject = [];

    _callback;
    
    constructor (data, onload){
        super("Stage");

        this._callback = onload;

        for(var z = 0; z < data.map.length; z++) {
            for(var x = 0; x < data.map[z].length; x++) {
                switch(Math.floor(data.map[z][x] / 10000)){
                    case 2:
                        this._wallGenerate(x * this._squareSize, 0, z * this._squareSize);
                        break;
                    default:
                } 
            } 
        }
        
        // 環境光源
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        this._scene.add(ambientLight);

        // 平行光源
        const light = new THREE.DirectionalLight(0xFFFFFF);
        light.intensity = 2; // 光の強さを倍に
        light.position.set(data.side / 2 * this._squareSize, 200, data.side / 2 * this._squareSize);
        this._scene.add(light);

        const gridHelper = new THREE.GridHelper(data.side * this._squareSize, data.side, 0xffffff, 0xffffff);
        gridHelper.position.set(data.side * this._squareSize / 2, 999, data.side * this._squareSize / 2);
        //座標の調整
        if(data.side % 2 === 0){
            gridHelper.position.x += -50;
            gridHelper.position.z += -50;
        }
        this._scene.add(gridHelper);

        this._loadData.push({"url" : this._urls["you"], "position" : data.start, "flag" : false});
        for(let index in data.boxs) {
            this._loadData.push({"url" : this._urls["box"], "position" : data.boxs[index], "flag" : false});
        }
        this._load();
    }

    _load (){
        const loader = new GLTFLoader();
        for(let index in this._loadData) {
            loader.load(this._loadData[index].url,
                (gltf) => {
                    this._moveObject[index] = gltf.scene;
                    this._moveObject[index].scale.set(this._squareSize, this._squareSize, this._squareSize);
                    this._moveObject[index].position.set(this._loadData[index].position.x * this._squareSize, 0, this._loadData[index].position.z * this._squareSize);
                    this._scene.add(this._moveObject[index]);
                    this._loadData[index].flag = true;
                    this._loadComplete();
                }
            );
        }
    }

    _loadComplete (){
        let check = this._loadData.every(val => {
            return val.flag;
        });

        if (check) this._callback();
    }

    _wallGenerate (x, y, z){
        let box = new THREE.Mesh(this._wallData.geometry, this._wallData.material);
        box.position.set(x, y, z);
        this._scene.add(box);
    }

    move (code, direction, distance){
        let x = 0;
        let z = 0;

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

    get squareSize (){
        return this._squareSize;
    }
}