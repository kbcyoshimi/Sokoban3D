import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";

export class MapScene{
    
    _scene;
    _wallData;

    constructor (data, test){

        this._scene = new THREE.Scene();
        this._wallData = {
            "geometry": new THREE.BoxGeometry(100, 100, 100),
            "material": new THREE.MeshNormalMaterial()
        }

        for(var z = 0; z < data.map.length; z++) {
            for(var x = 0; x < data.map[z].length; x++) {
                switch(data.map[z][x]){
                    case 1:
                        this._wallGenerate(x * 100, 0, z * 100);
                        break;
                    default:
                } 
            } 
        }
        
        // 環境光源
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0);
        //this._scene.add(ambientLight);

        // 平行光源
        const light = new THREE.DirectionalLight(0xFFFFFF);
        light.intensity = 2; // 光の強さを倍に
        light.position.set(data.s[0] * 100, -50, 1450);
        // シーンに追加
        this._scene.add(light);

        const loader = new GLTFLoader();
        const url = 'model/仮頭.glb';

        loader.load(url, 
            (gltf) => {
                const obj = gltf.scene;
                obj.scale.set(100.0, 100.0, 100.0);
                obj.position.set(data.s[0] * 100, 0, 1400);
                this._scene.add(obj);
                this._wallGenerate(15 * 100, 0, 15 * 100);
                test.render();
            }
        );

        const gridHelper = new THREE.GridHelper( data.side * 100, data.side );
        gridHelper.position.set(900, 999, 900);
        this._scene.add( gridHelper );
    }

    _wallGenerate (x, y, z){
        let box = new THREE.Mesh(this._wallData.geometry, this._wallData.material);
        box.position.set(x, y, z);
        this._scene.add(box);
    }

    get scene (){
        return this._scene;
    }
}