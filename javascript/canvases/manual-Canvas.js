import * as THREE from "../modules/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";
import { Canvas } from "./canvas";

const X = -500;
const Z = -500;
const ZD = -100;

const FONT_NAME = "SoftFont";
const FONT_URL = "url(./font/Corporate-Logo-Rounded.ttf)";

const FONT = "20px " + FONT_NAME;

export class ManualCanvas extends Canvas{

    _controls;
    _font;

    constructor (){
        super("#manualCanvas");
        this._camera = new THREE.PerspectiveCamera(90, this._canvas.clientWidth / this._canvas.clientHeight);
        let fontFace = new FontFace(
            FONT_NAME,
            FONT_URL
        );

        fontFace.load().then();
    }

    startStageMode (data){
        if(this._mode !== null) return;

        this._camera = new THREE.OrthographicCamera(0, this._canvas.clientWidth, this._canvas.clientHeight, 0);

        let halfWidth = this._canvas.clientWidth / 2;
        let halfHeight = this._canvas.clientHeight / 2;

        this._camera.position.set(X - halfWidth, -halfHeight , Z);

        super.startStageMode();
    }

    TextForMesh (text){
        let geo = new THREE.PlaneGeometry(this._canvas.clientWidth, this._canvas.clientHeight);
        let mat = new THREE.MeshBasicMaterial({
            "map" : this.TextForTexture(text)
        });

        let mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(X, 0, Z + ZD);
        mesh.material.transparent = true;

        return mesh;
    }

    TextForTexture (text){
        // 貼り付けるcanvasを作成。
        let canvasForText = document.createElement("canvas");
        let ctx = canvasForText.getContext("2d");
        ctx.canvas.width = this._canvas.clientWidth;
        ctx.canvas.height = this._canvas.clientHeight;

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "white";
        ctx.font = FONT;

        ctx.fillText(
            text,
            (this._canvas.clientWidth - ctx.measureText(text).width) / 2,
            this._canvas.clientHeight / 2 + ctx.measureText(text).actualBoundingBoxAscent / 2
        );
       
        let canvasTexture = new THREE.CanvasTexture(canvasForText);

        return canvasTexture;
    }
}