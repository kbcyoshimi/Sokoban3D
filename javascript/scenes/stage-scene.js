import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";
import { Scene } from "./scene.js";

export class StageScene extends Scene{

    _urls = {
        "you" : "model/you.glb",
        "box" : "model/box.glb"
    }

    _squareSize = 100;

    _wallData = {
        "geometry": new THREE.BoxGeometry(this._squareSize, this._squareSize, this._squareSize),
        "material": new THREE.MeshNormalMaterial()
    };

    _you = null;
    _youScale = new THREE.Vector3(100, 90, 100);
    _loadData = [];
    _moveObject = [];

    _callback = null;
    
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
        gridHelper.position.x += -50;
        gridHelper.position.z += -50;
        this._scene.add(gridHelper);

        this._loadData.push(this._loadDataCreate("you", data.start, this._youScale));
        for(let index in data.boxs) {
            this._loadData.push(this._loadDataCreate("box", data.boxs[index]));
        }
        this._load();
    }

    _loadDataCreate (name, position, scale = new THREE.Vector3(100, 100, 100)){
        if (!position.y) position.y = 0;
        return {
            "url" : this._urls[name],
            "position" : position,
            "scale" : scale,
            "frag" : false
        };
    }

    _load (){
        const loader = new GLTFLoader();
        for(let index in this._loadData) {
            loader.load(this._loadData[index].url,
                (gltf) => {
                    this._moveObject[index] = gltf.scene;
                    this._moveObject[index].scale.copy(this._loadData[index].scale);
                    this._moveObject[index].position.set(this._loadData[index].position.x * this._squareSize, this._loadData[index].position.y, this._loadData[index].position.z * this._squareSize);
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

        if (check) {
            this._you = this._moveObject[0];
            this._callback();
            this._callback = null;
        }
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

    get you (){
        return this._you;
    }
}