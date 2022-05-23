import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";
import { Scene } from "./scene.js";

export class StageScene extends Scene{

    _you;

    _wallData;

    _animetionFrag;
    
    constructor (data, onload){
        super("Stage");

        this._wallData = {
            "geometry": new THREE.BoxGeometry(100, 100, 100),
            "material": new THREE.MeshNormalMaterial()
        }

        for(var z = 0; z < data.map.length; z++) {
            for(var x = 0; x < data.map[z].length; x++) {
                switch(Math.round(data.map[z][x] / 10000)){
                    case 2:
                        this._wallGenerate(x * 100, 0, z * 100);
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
        light.position.set(data.start.x * 100, 0, 900);
        // シーンに追加
        this._scene.add(light);

        const loader = new GLTFLoader();
        const url = 'model/仮頭.glb';

        loader.load(url, 
            (gltf) => {
                this._you = gltf.scene;
                this._you.scale.set(100.0, 100.0, 100.0);
                this._you.position.set(data.start.x * 100, 0, data.start.z * 100);
                this._scene.add(this._you);
                onload();
            }
        );

        const gridHelper = new THREE.GridHelper(data.side * 100, data.side, 0xffffff, 0xffffff);
        gridHelper.position.set(data.side * 100 / 2, 999, data.side * 100 / 2);
        if(data.side % 2 === 0){
            gridHelper.position.x += -50;
            gridHelper.position.z += -50;
        }
        this._scene.add(gridHelper);
    }

    _wallGenerate (x, y, z){
        let box = new THREE.Mesh(this._wallData.geometry, this._wallData.material);
        box.position.set(x, y, z);
        this._scene.add(box);
    }

    youMove (x, z){
        this._you.position.x = x * 100;
        this._you.position.z = z * 100;
    }
}