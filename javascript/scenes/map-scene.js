import * as THREE from "../modules/three.module.js";
import { GLTFLoader } from "../modules/GLTFLoader";

export class MapScene{
    
    _scene;
    _wallData;

    constructor (data){

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

        const loader = new THREE.GLTFLoader();
        const url = 'model/仮頭.glb';

        //const gridHelper = new THREE.GridHelper( data.side * 100, data.side );
        //gridHelper.position.y = 999;
        //scene.add( gridHelper );
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